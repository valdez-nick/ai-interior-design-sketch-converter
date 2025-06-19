# Technical Implementation Guide: Interior Design AI Sketch Converter

## Overview

This guide provides detailed technical implementation instructions for building an AI-powered interior design sketch conversion system using Stable Diffusion with ControlNet.

## 1. Core Implementation

### 1.1 Base Sketch Converter Class

```python
import torch
from PIL import Image
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
import cv2
import numpy as np
from transformers import pipeline

class InteriorSketchConverter:
    """
    Main class for converting 3D renders to architectural sketches
    """
    
    def __init__(self, device="cuda", model_path=None):
        self.device = device
        self.model_path = model_path or "stabilityai/stable-diffusion-xl-base-1.0"
        
        # Initialize models
        self._load_models()
        
        # Sketch style configurations
        self.styles = {
            "concept": {
                "prompt": "architectural concept sketch, loose hand drawn lines, minimal detail, gestural strokes",
                "negative_prompt": "photo, realistic, colored, detailed, digital art",
                "controlnet_model": "lllyasviel/control_v11p_sd15_hed",
                "conditioning_scale": 0.6
            },
            "technical": {
                "prompt": "technical architectural drawing, precise lines, clean linework, professional drafting",
                "negative_prompt": "artistic, loose, watercolor, sketch, rough",
                "controlnet_model": "lllyasviel/control_v11p_sd15_mlsd",
                "conditioning_scale": 0.9
            },
            "presentation": {
                "prompt": "architectural presentation sketch, professional hand drawing, clean lines with subtle shading",
                "negative_prompt": "photo, 3d render, colored, messy",
                "controlnet_model": "lllyasviel/control_v11p_sd15_canny",
                "conditioning_scale": 0.75
            }
        }
    
    def _load_models(self):
        """Load AI models with optimization"""
        # Load ControlNet models
        self.controlnet_models = {}
        for style, config in self.styles.items():
            self.controlnet_models[style] = ControlNetModel.from_pretrained(
                config["controlnet_model"],
                torch_dtype=torch.float16
            )
        
        # Load base SD pipeline (reuse for efficiency)
        self.pipe = StableDiffusionControlNetPipeline.from_pretrained(
            self.model_path,
            controlnet=self.controlnet_models["concept"],  # Default
            torch_dtype=torch.float16,
            safety_checker=None,
            requires_safety_checker=False
        ).to(self.device)
        
        # Enable memory efficient attention
        self.pipe.enable_xformers_memory_efficient_attention()
        
    def preprocess_image(self, image, style="concept"):
        """
        Preprocess image based on selected style
        """
        if isinstance(image, str):
            image = Image.open(image).convert("RGB")
        
        # Resize to optimal dimensions (maintain aspect ratio)
        image = self._resize_image(image)
        
        # Apply edge detection based on style
        if style == "technical":
            control_image = self._apply_mlsd(image)
        elif style == "presentation":
            control_image = self._apply_canny(image)
        else:  # concept
            control_image = self._apply_hed(image)
        
        return image, control_image
    
    def _resize_image(self, image, max_size=1024):
        """Resize image maintaining aspect ratio"""
        width, height = image.size
        
        if width > height:
            if width > max_size:
                height = int(height * max_size / width)
                width = max_size
        else:
            if height > max_size:
                width = int(width * max_size / height)
                height = max_size
        
        # Ensure dimensions are divisible by 8
        width = (width // 8) * 8
        height = (height // 8) * 8
        
        return image.resize((width, height), Image.Resampling.LANCZOS)
    
    def _apply_canny(self, image, low_threshold=100, high_threshold=200):
        """Apply Canny edge detection"""
        image_array = np.array(image)
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, low_threshold, high_threshold)
        edges_rgb = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)
        return Image.fromarray(edges_rgb)
    
    def _apply_mlsd(self, image):
        """Apply M-LSD line detection for architectural elements"""
        from controlnet_aux import MLSDdetector
        
        mlsd = MLSDdetector.from_pretrained('lllyasviel/Annotators')
        result = mlsd(image)
        return result
    
    def _apply_hed(self, image):
        """Apply HED edge detection for artistic sketches"""
        from controlnet_aux import HEDdetector
        
        hed = HEDdetector.from_pretrained('lllyasviel/Annotators')
        result = hed(image)
        return result
    
    def convert(self, image, style="concept", seed=None, num_inference_steps=20):
        """
        Convert 3D render to sketch
        
        Args:
            image: PIL Image or path to image
            style: One of "concept", "technical", "presentation"
            seed: Random seed for reproducibility
            num_inference_steps: Number of denoising steps
            
        Returns:
            PIL Image of the sketch
        """
        # Set random seed if provided
        if seed is not None:
            generator = torch.Generator(device=self.device).manual_seed(seed)
        else:
            generator = None
        
        # Preprocess image
        original_image, control_image = self.preprocess_image(image, style)
        
        # Update pipeline with appropriate ControlNet
        self.pipe.controlnet = self.controlnet_models[style]
        
        # Get style configuration
        style_config = self.styles[style]
        
        # Generate sketch
        result = self.pipe(
            prompt=style_config["prompt"],
            negative_prompt=style_config["negative_prompt"],
            image=control_image,
            num_inference_steps=num_inference_steps,
            generator=generator,
            guidance_scale=7.5,
            controlnet_conditioning_scale=style_config["conditioning_scale"]
        ).images[0]
        
        return result
    
    def batch_convert(self, images, style="concept", progress_callback=None):
        """
        Convert multiple images maintaining consistent style
        """
        results = []
        
        # Use consistent seed for style consistency
        base_seed = torch.randint(0, 1000000, (1,)).item()
        
        for idx, image in enumerate(images):
            if progress_callback:
                progress_callback(idx, len(images))
            
            # Use incremental seeds for variation while maintaining style
            sketch = self.convert(image, style, seed=base_seed + idx)
            results.append(sketch)
        
        return results
```

### 1.2 Interior-Specific Enhancements

```python
class InteriorDesignEnhancer:
    """
    Specialized enhancements for interior design sketches
    """
    
    def __init__(self):
        # Load furniture detection model
        self.furniture_detector = self._load_furniture_detector()
        
        # Material patterns for sketch enhancement
        self.material_patterns = {
            "wood": self._load_pattern("wood_grain"),
            "fabric": self._load_pattern("fabric_texture"),
            "metal": self._load_pattern("metal_shading"),
            "glass": self._load_pattern("glass_reflection")
        }
    
    def _load_furniture_detector(self):
        """Load YOLO or similar model trained on furniture"""
        from ultralytics import YOLO
        
        # Use a model fine-tuned on interior furniture
        model = YOLO('models/furniture_yolov8.pt')
        return model
    
    def detect_furniture(self, image):
        """
        Detect and classify furniture in the image
        """
        results = self.furniture_detector(image)
        
        furniture_items = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                furniture_items.append({
                    "bbox": box.xyxy[0].tolist(),
                    "confidence": box.conf[0].item(),
                    "class": r.names[int(box.cls[0])],
                    "area": self._calculate_area(box.xyxy[0])
                })
        
        return furniture_items
    
    def enhance_materials(self, sketch, original_image, furniture_data):
        """
        Add material indications to sketch based on detected furniture
        """
        sketch_array = np.array(sketch)
        
        for item in furniture_data:
            # Determine material based on furniture type
            material = self._infer_material(item["class"])
            
            if material and material in self.material_patterns:
                # Apply subtle pattern overlay
                pattern = self.material_patterns[material]
                bbox = [int(x) for x in item["bbox"]]
                
                # Extract region
                region = sketch_array[bbox[1]:bbox[3], bbox[0]:bbox[2]]
                
                # Apply pattern with low opacity
                enhanced_region = self._apply_pattern(region, pattern, opacity=0.15)
                
                # Put back
                sketch_array[bbox[1]:bbox[3], bbox[0]:bbox[2]] = enhanced_region
        
        return Image.fromarray(sketch_array)
    
    def _infer_material(self, furniture_class):
        """Infer material from furniture type"""
        material_mapping = {
            "chair": "fabric",
            "table": "wood",
            "sofa": "fabric",
            "cabinet": "wood",
            "lamp": "metal",
            "mirror": "glass"
        }
        return material_mapping.get(furniture_class.lower(), None)
```

### 1.3 Annotation System

```python
class SketchAnnotator:
    """
    Add intelligent annotations to architectural sketches
    """
    
    def __init__(self):
        self.font = self._load_architectural_font()
        self.annotation_styles = {
            "minimal": {"font_size": 10, "line_weight": 1},
            "detailed": {"font_size": 12, "line_weight": 2},
            "presentation": {"font_size": 14, "line_weight": 2}
        }
    
    def annotate_sketch(self, sketch, annotations, style="minimal"):
        """
        Add annotations to sketch
        
        Args:
            sketch: PIL Image
            annotations: List of annotation dicts
            style: Annotation style
        """
        from PIL import ImageDraw, ImageFont
        
        # Create drawing context
        draw = ImageDraw.Draw(sketch)
        
        # Get style settings
        settings = self.annotation_styles[style]
        
        for ann in annotations:
            if ann["type"] == "dimension":
                self._draw_dimension(draw, ann, settings)
            elif ann["type"] == "label":
                self._draw_label(draw, ann, settings)
            elif ann["type"] == "material":
                self._draw_material_callout(draw, ann, settings)
        
        return sketch
    
    def _draw_dimension(self, draw, annotation, settings):
        """Draw dimension lines"""
        start = annotation["start"]
        end = annotation["end"]
        text = annotation["text"]
        
        # Draw dimension line
        draw.line([start, end], fill="black", width=settings["line_weight"])
        
        # Draw end caps
        cap_length = 10
        angle = np.arctan2(end[1] - start[1], end[0] - start[0])
        perpendicular = angle + np.pi / 2
        
        for point in [start, end]:
            cap_start = (
                point[0] + cap_length * np.cos(perpendicular),
                point[1] + cap_length * np.sin(perpendicular)
            )
            cap_end = (
                point[0] - cap_length * np.cos(perpendicular),
                point[1] - cap_length * np.sin(perpendicular)
            )
            draw.line([cap_start, cap_end], fill="black", width=settings["line_weight"])
        
        # Draw dimension text
        mid_point = ((start[0] + end[0]) / 2, (start[1] + end[1]) / 2)
        draw.text(mid_point, text, fill="black", font=self.font, anchor="mm")
    
    def auto_generate_annotations(self, sketch, room_data):
        """
        Automatically generate relevant annotations
        """
        annotations = []
        
        # Add room dimensions
        if "dimensions" in room_data:
            annotations.extend(self._create_dimension_annotations(room_data["dimensions"]))
        
        # Add furniture labels
        if "furniture" in room_data:
            annotations.extend(self._create_furniture_labels(room_data["furniture"]))
        
        # Add material callouts for key elements
        if "materials" in room_data:
            annotations.extend(self._create_material_callouts(room_data["materials"]))
        
        return annotations
```

## 2. Deployment Implementation

### 2.1 RunPod Serverless Deployment

```python
# runpod_handler.py
import runpod
import base64
from io import BytesIO
from interior_sketch_converter import InteriorSketchConverter

# Initialize converter
converter = InteriorSketchConverter(device="cuda")

def handler(event):
    """
    RunPod serverless handler for sketch conversion
    """
    try:
        # Parse input
        input_data = event['input']
        
        # Decode base64 image
        image_data = base64.b64decode(input_data['image'])
        image = Image.open(BytesIO(image_data))
        
        # Get parameters
        style = input_data.get('style', 'concept')
        seed = input_data.get('seed', None)
        
        # Convert to sketch
        sketch = converter.convert(image, style=style, seed=seed)
        
        # Encode result
        buffered = BytesIO()
        sketch.save(buffered, format="PNG")
        sketch_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return {
            "sketch": sketch_base64,
            "style": style,
            "dimensions": f"{sketch.width}x{sketch.height}"
        }
        
    except Exception as e:
        return {"error": str(e)}

# Start serverless worker
runpod.serverless.start({"handler": handler})
```

### 2.2 ComfyUI Workflow

```json
{
  "workflow": {
    "name": "Interior Design Sketch Converter",
    "nodes": [
      {
        "id": "1",
        "type": "LoadImage",
        "outputs": ["IMAGE"]
      },
      {
        "id": "2",
        "type": "ControlNetPreprocessor",
        "inputs": {
          "image": ["1", 0],
          "preprocessor": "mlsd"
        },
        "outputs": ["CONTROL_IMAGE"]
      },
      {
        "id": "3",
        "type": "LoadControlNet",
        "inputs": {
          "control_net_name": "control_v11p_sd15_mlsd.pth"
        },
        "outputs": ["CONTROL_NET"]
      },
      {
        "id": "4",
        "type": "OllamaPromptEnhancer",
        "inputs": {
          "base_prompt": "architectural sketch",
          "model": "mistral:latest"
        },
        "outputs": ["PROMPT"]
      },
      {
        "id": "5",
        "type": "KSampler",
        "inputs": {
          "model": "sd_xl_base_1.0.safetensors",
          "positive": ["4", 0],
          "negative": "photo, realistic, colored",
          "control_net": ["3", 0],
          "control_image": ["2", 0]
        },
        "outputs": ["LATENT"]
      },
      {
        "id": "6",
        "type": "VAEDecode",
        "inputs": {
          "samples": ["5", 0]
        },
        "outputs": ["IMAGE"]
      },
      {
        "id": "7",
        "type": "SaveImage",
        "inputs": {
          "images": ["6", 0],
          "filename_prefix": "interior_sketch"
        }
      }
    ]
  }
}
```

### 2.3 API Server Implementation

```python
# app.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import asyncio
from concurrent.futures import ThreadPoolExecutor
import redis
import hashlib

app = FastAPI(title="Interior Design Sketch API")

# Initialize components
converter = InteriorSketchConverter()
cache = redis.Redis(host='localhost', port=6379, db=0)
executor = ThreadPoolExecutor(max_workers=4)

@app.post("/convert")
async def convert_to_sketch(
    file: UploadFile = File(...),
    style: str = "concept",
    use_cache: bool = True
):
    """
    Convert uploaded image to architectural sketch
    """
    # Read image
    contents = await file.read()
    
    # Check cache
    if use_cache:
        cache_key = hashlib.md5(contents + style.encode()).hexdigest()
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return StreamingResponse(
                BytesIO(cached_result),
                media_type="image/png"
            )
    
    # Process image
    image = Image.open(BytesIO(contents))
    
    # Run conversion in thread pool
    loop = asyncio.get_event_loop()
    sketch = await loop.run_in_executor(
        executor,
        converter.convert,
        image,
        style
    )
    
    # Save to cache
    buffered = BytesIO()
    sketch.save(buffered, format="PNG")
    result_bytes = buffered.getvalue()
    
    if use_cache:
        cache.setex(cache_key, 3600, result_bytes)  # Cache for 1 hour
    
    return StreamingResponse(
        BytesIO(result_bytes),
        media_type="image/png",
        headers={
            "Content-Disposition": f"attachment; filename=sketch_{style}.png"
        }
    )

@app.post("/batch")
async def batch_convert(
    files: List[UploadFile] = File(...),
    style: str = "concept"
):
    """
    Batch convert multiple images
    """
    tasks = []
    
    for file in files:
        task = convert_to_sketch(file, style, use_cache=True)
        tasks.append(task)
    
    results = await asyncio.gather(*tasks)
    
    # Create zip file with results
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        for idx, result in enumerate(results):
            zip_file.writestr(
                f"sketch_{idx+1}.png",
                result.body
            )
    
    return StreamingResponse(
        BytesIO(zip_buffer.getvalue()),
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=sketches.zip"
        }
    )

@app.get("/styles")
async def list_styles():
    """
    Get available sketch styles
    """
    return {
        "styles": [
            {
                "id": "concept",
                "name": "Concept Sketch",
                "description": "Loose, artistic sketch for initial concepts"
            },
            {
                "id": "technical",
                "name": "Technical Drawing",
                "description": "Precise lines for technical documentation"
            },
            {
                "id": "presentation",
                "name": "Presentation Sketch",
                "description": "Professional sketch for client presentations"
            }
        ]
    }
```

## 3. Frontend Integration

### 3.1 React Component

```jsx
// SketchConverter.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const SketchConverter = () => {
  const [images, setImages] = useState([]);
  const [sketches, setSketches] = useState([]);
  const [style, setStyle] = useState('concept');
  const [loading, setLoading] = useState(false);
  
  const onDrop = useCallback(acceptedFiles => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });
  
  const convertToSketches = async () => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      images.forEach(img => {
        formData.append('files', img.file);
      });
      formData.append('style', style);
      
      const response = await axios.post('/api/batch', formData, {
        responseType: 'blob'
      });
      
      // Handle zip file response
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sketches.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="sketch-converter">
      <div className="upload-area" {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the images here...</p>
        ) : (
          <p>Drag 'n' drop interior images, or click to select</p>
        )}
      </div>
      
      <div className="style-selector">
        <h3>Select Sketch Style</h3>
        <select 
          value={style} 
          onChange={(e) => setStyle(e.target.value)}
        >
          <option value="concept">Concept Sketch</option>
          <option value="technical">Technical Drawing</option>
          <option value="presentation">Presentation Sketch</option>
        </select>
      </div>
      
      <div className="image-grid">
        {images.map((img, idx) => (
          <div key={idx} className="image-preview">
            <img src={img.preview} alt={`Upload ${idx}`} />
          </div>
        ))}
      </div>
      
      <button 
        onClick={convertToSketches}
        disabled={images.length === 0 || loading}
      >
        {loading ? 'Converting...' : 'Convert to Sketches'}
      </button>
    </div>
  );
};

export default SketchConverter;
```

### 3.2 Progressive Web App Configuration

```javascript
// service-worker.js
const CACHE_NAME = 'interior-sketch-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Cache strategy for API responses
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/convert')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then(response => {
            // Cache successful conversions
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          });
        })
    );
  }
});
```

## 4. Testing Suite

```python
# test_converter.py
import pytest
from PIL import Image
import numpy as np
from interior_sketch_converter import InteriorSketchConverter

class TestSketchConverter:
    @pytest.fixture
    def converter(self):
        return InteriorSketchConverter(device="cpu")  # CPU for testing
    
    @pytest.fixture
    def sample_interior_image(self):
        # Create synthetic interior image
        img = Image.new('RGB', (512, 512), color='white')
        # Add some geometric shapes to simulate furniture
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        draw.rectangle([100, 100, 300, 300], outline='black', width=3)
        draw.rectangle([350, 200, 450, 400], outline='black', width=3)
        return img
    
    def test_style_conversion(self, converter, sample_interior_image):
        """Test each style produces different results"""
        results = {}
        
        for style in ['concept', 'technical', 'presentation']:
            sketch = converter.convert(sample_interior_image, style=style)
            results[style] = np.array(sketch)
        
        # Ensure different styles produce different outputs
        assert not np.array_equal(results['concept'], results['technical'])
        assert not np.array_equal(results['technical'], results['presentation'])
    
    def test_consistency(self, converter, sample_interior_image):
        """Test same seed produces consistent results"""
        sketch1 = converter.convert(sample_interior_image, seed=42)
        sketch2 = converter.convert(sample_interior_image, seed=42)
        
        assert np.array_equal(np.array(sketch1), np.array(sketch2))
    
    def test_batch_processing(self, converter):
        """Test batch conversion maintains quality"""
        images = [
            Image.new('RGB', (512, 512), color='white')
            for _ in range(3)
        ]
        
        results = converter.batch_convert(images, style='concept')
        
        assert len(results) == 3
        assert all(isinstance(r, Image.Image) for r in results)
```

This implementation guide provides a complete technical foundation for building an interior design sketch conversion tool with AI integration.