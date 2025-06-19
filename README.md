# AI-Enhanced Interior Design Sketch Converter

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-interior-design-sketch-converter)

A professional web application that converts 3D rendered interior images to hand-drawn sketches using AI and advanced computer vision. Designed specifically for interior designers, architects, and design professionals.

## 🚀 Live Demo

**[Try the app live →](https://your-app.vercel.app)**

## ✨ Features

### 🎨 Multiple Sketch Styles
- **Pencil Sketch**: Soft, artistic concept drawings
- **Pen Drawing**: Clean, professional line work  
- **Technical Drawing**: Precise architectural documentation
- **Charcoal**: Expressive, textured sketches
- **Style-Specific**: Modern, Scandinavian, Industrial, Bohemian, Traditional

### 🤖 AI-Powered Processing
- **Multiple AI Providers**: OpenAI, Anthropic, Google AI, RunPod
- **Smart Material Detection**: Automatic identification of wood, fabric, metal, glass, stone
- **Furniture Recognition**: Preserves furniture details and spatial relationships
- **Room Type Analysis**: Intelligent room categorization and style recommendations

### ⚡ Performance Features
- **Batch Processing**: Process multiple images simultaneously
- **Preset Management**: Save and share custom style configurations
- **Real-time Preview**: See results as you adjust settings
- **Progressive Loading**: Optimized for fast performance
- **Offline Capable**: Works without internet for basic processing

### 📱 Professional UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Drag & Drop**: Easy file uploading
- **Collapsible Panels**: Organized, clean interface
- **Export Options**: PNG, JPEG, SVG, PDF formats
- **Progress Tracking**: Real-time processing feedback

## 🚀 Quick Deployment

### Deploy to Vercel (Recommended)

1. **Click the deploy button above** or:

2. **Manual deployment:**
   ```bash
   # Fork this repository
   # Connect to Vercel
   # Add environment variables (optional for AI features)
   # Deploy
   ```

3. **Environment Variables** (for AI features):
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   RUNPOD_API_KEY=your_runpod_api_key
   ```

4. **Access your app** at `https://your-project.vercel.app`

[📖 **Detailed Deployment Guide →**](./VERCEL_DEPLOYMENT_GUIDE.md)

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- Modern web browser
- Optional: AI service API keys

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/ai-interior-design-sketch-converter.git
cd ai-interior-design-sketch-converter

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your API keys (optional)
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## 💻 Usage

### Web Interface

1. **Upload Image**: Drag & drop or click to select interior image
2. **Choose Style**: Select from pencil, pen, charcoal, or specialty styles
3. **Configure Settings**: Adjust line thickness, variation, edge detection
4. **Process**: Click "Process Image" to generate sketch
5. **Download**: Save result in your preferred format

### API Endpoints

The app provides RESTful API endpoints for programmatic access:

#### Process Single Image
```bash
POST /api/ai-process
Content-Type: application/json

{
  "imageData": "base64_encoded_image",
  "provider": "openai",
  "stylePreset": "pencil",
  "options": {
    "quality": "high",
    "width": 512,
    "height": 512
  }
}
```

#### Batch Processing
```bash
POST /api/batch-process
Content-Type: application/json

{
  "images": [
    {"data": "base64_image", "filename": "room1.jpg"},
    {"data": "base64_image", "filename": "room2.jpg"}
  ],
  "provider": "openai",
  "stylePreset": "modern"
}
```

#### Health Check
```bash
GET /api/health
```

## 🎯 Use Cases

### For Interior Designers
- **Concept Presentations**: Create hand-drawn style concepts from 3D models
- **Client Communication**: Present ideas in an approachable, artistic format
- **Design Development**: Explore different artistic representations
- **Portfolio Creation**: Convert technical drawings to portfolio pieces

### For Architects
- **Schematic Design**: Artistic representation of spatial concepts
- **Client Presentations**: Humanize technical drawings
- **Design Documentation**: Create varied drawing styles for different audiences
- **Competition Entries**: Stand out with hand-drawn aesthetic

### For Real Estate
- **Property Marketing**: Artistic renderings for listings
- **Staging Visualization**: Show potential furniture arrangements
- **Development Marketing**: Present projects in appealing formats

## 🔧 Configuration

### Style Presets

The app includes built-in presets optimized for different use cases:

- **Quick Concept**: Fast sketches for brainstorming
- **Detailed Presentation**: High-quality client presentations
- **Material Focused**: Emphasizes textures and materials
- **Modern Minimalist**: Clean, contemporary style

### Custom Presets

Create and save your own style configurations:

1. Adjust settings to your preference
2. Click "Save Preset"
3. Name and categorize your preset
4. Share with team members via export

## 📊 Technical Architecture

### Frontend
- **Vanilla JavaScript**: No framework dependencies for fast loading
- **HTML5 Canvas**: High-performance image processing
- **CSS Grid/Flexbox**: Responsive, modern layout
- **Web Workers**: Background processing for large images

### Backend (Serverless)
- **Vercel Functions**: Auto-scaling serverless processing
- **Node.js Runtime**: Fast JavaScript execution
- **Edge Network**: Global CDN for optimal performance
- **Environment Security**: Secure API key handling

### AI Integration
- **Multiple Providers**: Fallback systems for reliability
- **Rate Limiting**: Prevents API abuse
- **Error Handling**: Graceful degradation
- **Cost Optimization**: Intelligent provider routing

## 🔒 Security & Privacy

### Data Protection
- **No Data Storage**: Images processed in memory only
- **Secure Transmission**: HTTPS encryption for all data
- **API Key Security**: Server-side environment variables
- **CORS Protection**: Controlled access origins

### Privacy Features
- **Local Processing**: Traditional algorithms work offline
- **Optional AI**: AI features are opt-in only
- **No Tracking**: No user data collection
- **Open Source**: Transparent, auditable code

## 📈 Performance

### Optimization Features
- **CDN Delivery**: Global edge caching
- **Image Compression**: Automatic optimization
- **Lazy Loading**: Progressive resource loading
- **Bundle Splitting**: Minimal initial load

### Benchmarks
- **Page Load**: < 2 seconds
- **Processing Time**: 5-30 seconds depending on complexity
- **Memory Usage**: < 100MB for typical images
- **Bandwidth**: Optimized for mobile networks

## 🛣️ Roadmap

### Version 2.0 (Coming Soon)
- [ ] Advanced material recognition
- [ ] Style transfer learning
- [ ] Real-time collaborative editing
- [ ] Mobile app development
- [ ] CAD software plugins

### Future Features
- [ ] 3D model direct import
- [ ] Animation support
- [ ] Team workspace features
- [ ] Advanced color management
- [ ] Custom training capabilities

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/your-username/ai-interior-design-sketch-converter.git

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **AI Providers**: OpenAI, Anthropic, Google, RunPod for AI capabilities
- **Open Source**: Built on numerous open-source libraries
- **Design Community**: Feedback and testing from design professionals
- **Contributors**: Thanks to all who have contributed to this project

## 📞 Support

- **Documentation**: [Full documentation](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/ai-interior-design-sketch-converter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-interior-design-sketch-converter/discussions)
- **Email**: support@yourapp.com

---

**Made with ❤️ for the design community**
)
```

#### REST API
```bash
# Convert single image
curl -X POST "http://localhost:8000/convert" \
  -F "file=@interior.jpg" \
  -F "style=presentation" \
  --output sketch.png

# Batch convert
curl -X POST "http://localhost:8000/batch" \
  -F "files=@room1.jpg" \
  -F "files=@room2.jpg" \
  -F "style=concept" \
  --output sketches.zip
```

#### Web Interface
1. Open http://localhost:8080
2. Drag and drop interior images
3. Select sketch style
4. Click "Convert to Sketches"
5. Download results

## Configuration

### Style Presets

Each style is optimized for different use cases:

```python
# Concept Sketch - For initial design exploration
{
    "style": "concept",
    "description": "Loose, artistic lines with minimal detail",
    "use_case": "Early design concepts, brainstorming",
    "processing_time": "10-15 seconds"
}

# Technical Drawing - For documentation
{
    "style": "technical", 
    "description": "Precise lines with architectural accuracy",
    "use_case": "Construction documents, technical specs",
    "processing_time": "15-20 seconds"
}

# Presentation Sketch - For client meetings
{
    "style": "presentation",
    "description": "Professional sketch with balanced detail",
    "use_case": "Client presentations, marketing materials", 
    "processing_time": "12-18 seconds"
}
```

### Performance Optimization

#### GPU Memory Management
```python
# Automatic batch size optimization
config = {
    "max_batch_size": 4,
    "auto_optimize": True,
    "memory_threshold": 0.8  # Use 80% of available VRAM
}
```

#### Caching Configuration
```python
# Intelligent caching for faster repeated conversions
cache_config = {
    "enabled": True,
    "ttl": 3600,  # 1 hour
    "max_size_gb": 10,
    "strategy": "lru"  # Least Recently Used
}
```

## Integration Examples

### SketchUp Plugin
```ruby
# SketchUp Ruby script integration
module InteriorSketchAI
  def self.convert_active_view
    # Capture current viewport
    view = Sketchup.active_model.active_view
    image = capture_viewport(view)
    
    # Send to AI converter
    sketch = AIConverter.process(image, style: "presentation")
    
    # Display result
    show_result_dialog(sketch)
  end
end
```

### Rhino Integration
```python
# Rhino Python script
import rhinoscriptsyntax as rs
from interior_sketch_ai import SketchConverter

def ConvertViewToSketch():
    converter = SketchConverter()
    
    # Get active viewport
    view = rs.CurrentView()
    bitmap = rs.ViewCaptureToFile(view, "temp.png")
    
    # Convert to sketch
    sketch = converter.convert("temp.png", style="concept")
    
    # Save result
    sketch.save("sketch_output.png")
```

## Advanced Features

### Smart Annotations
```python
# Automatic element detection and labeling
annotations = converter.generate_annotations(
    sketch=sketch,
    categories=["furniture", "fixtures", "materials"],
    style="minimal"  # or "detailed", "presentation"
)

# Apply annotations to sketch
annotated_sketch = converter.apply_annotations(sketch, annotations)
```

### Material Enhancement
```python
# Enhance sketch with material patterns
enhanced_sketch = converter.enhance_materials(
    sketch=sketch,
    original_image=original,
    materials={
        "wood": {"pattern": "grain", "intensity": 0.3},
        "fabric": {"pattern": "weave", "intensity": 0.2}
    }
)
```

### Batch Processing with Style Consistency
```python
# Process multiple views maintaining consistent style
results = converter.batch_convert_project(
    project_folder="./client_project",
    style="presentation",
    maintain_consistency=True,
    generate_style_guide=True
)
```

## Architecture

### AI Model Stack
- **Base Model**: Stable Diffusion XL (1024x1024 resolution)
- **Control Networks**: 
  - M-LSD for architectural lines
  - Canny for detail preservation  
  - HED for artistic sketches
- **Enhancements**: Custom LoRA models trained on interior design sketches
- **Edge Detection**: Multi-algorithm approach for optimal results

### System Components
```
┌─────────────────────────────────────────────────┐
│                Web Interface                     │
├─────────────────────────────────────────────────┤
│              Processing Router                   │
│  ┌─────────────────┐  ┌─────────────────────┐   │
│  │ Local Processing │  │  Cloud Processing   │   │
│  │ ComfyUI+Ollama  │  │  RunPod Serverless  │   │
│  └─────────────────┘  └─────────────────────┘   │
├─────────────────────────────────────────────────┤
│            Caching & Storage Layer               │
└─────────────────────────────────────────────────┘
```

## Cost Analysis

### Local Deployment
- **Initial Setup**: GPU hardware ($500-2000)
- **Energy Cost**: ~$0.10-0.30 per hour of operation
- **Per Sketch**: Effectively free after setup
- **Break-even**: ~500-2000 sketches

### Cloud Deployment (RunPod)
- **Per Sketch**: $0.003-0.007
- **Monthly (1000 sketches)**: $3-7
- **No upfront costs**
- **Scales automatically**

### ROI for Interior Designers
- **Time Saved**: 2-4 hours per sketch
- **Value**: $50-200 per sketch (designer hourly rate)
- **Break-even**: ~25-50 sketches
- **Annual Savings**: $5,000-50,000+ depending on usage

## Development Roadmap

### Phase 1: MVP (Weeks 1-6) ✅
- [x] Core Stable Diffusion + ControlNet integration
- [x] Three primary sketch styles
- [x] Basic web interface
- [x] RunPod cloud deployment
- [x] File upload/download functionality

### Phase 2: Enhanced Features (Weeks 7-14)
- [ ] ComfyUI local processing option
- [ ] Custom interior design model fine-tuning
- [ ] Batch processing with style consistency
- [ ] SketchUp and Rhino plugins
- [ ] Advanced caching system

### Phase 3: Advanced AI (Weeks 15-26)
- [ ] Smart annotation system
- [ ] Material recognition and enhancement
- [ ] Real-time preview capabilities
- [ ] Multi-language support
- [ ] Advanced style transfer options

### Phase 4: Enterprise Features (Future)
- [ ] Team collaboration tools
- [ ] Project management integration
- [ ] Custom style training
- [ ] API rate limiting and billing
- [ ] Advanced analytics dashboard

## Documentation

- **[AI Integration Plan](AI_Integration_Plan.md)**: Comprehensive strategy and technical approach
- **[Technical Implementation Guide](Technical_Implementation_Guide.md)**: Detailed code examples and architecture
- **[Deployment & Configuration Guide](Deployment_Configuration_Guide.md)**: Setup instructions for local and cloud
- **[API Documentation](docs/api.md)**: Complete API reference
- **[Plugin Development Guide](docs/plugins.md)**: Creating integrations for design software

## Contributing

We welcome contributions from the interior design and AI communities!

### Development Setup
```bash
# Clone repository
git clone https://github.com/your-repo/interior-sketch-converter.git
cd interior-sketch-converter

# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/

# Format code
black . && isort .

# Type checking
mypy interior_sketch_converter/
```

### Areas for Contribution
- **New Sketch Styles**: Develop additional artistic styles
- **Software Integrations**: Plugins for AutoCAD, Revit, etc.
- **Performance Optimization**: GPU memory management, model quantization
- **UI/UX Improvements**: Better web interface, mobile support
- **Documentation**: Tutorials, examples, translations

## Support

### Community
- **Discord**: [Join our community](https://discord.gg/interior-sketch-ai)
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Share examples and get help

### Commercial Support
- **Professional Services**: Custom model training, enterprise deployment
- **Training**: Workshops for design teams
- **Priority Support**: SLA-backed assistance

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Stability AI**: For Stable Diffusion models
- **ControlNet Team**: For architectural control methods  
- **Interior Design Community**: For feedback and testing
- **Open Source Contributors**: For ongoing improvements

## Citation

If you use this tool in your research or professional work, please cite:

```bibtex
@software{interior_sketch_converter,
  title={Interior Design AI Sketch Converter},
  author={Your Team},
  year={2024},
  url={https://github.com/your-repo/interior-sketch-converter}
}
```

---

**Built with ❤️ for the interior design community**

*Transform your 3D visions into beautiful hand-drawn sketches with the power of AI*