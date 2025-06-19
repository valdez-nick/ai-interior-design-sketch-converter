# Deployment and Configuration Guide

## Overview

This guide covers deployment options, configuration settings, and optimization strategies for the Interior Design AI Sketch Converter.

## 1. Local Deployment with ComfyUI

### 1.1 System Requirements

```yaml
# requirements.yaml
minimum:
  gpu: NVIDIA RTX 3060 (12GB VRAM)
  cpu: Intel i5-9600K / AMD Ryzen 5 3600
  ram: 16GB DDR4
  storage: 50GB SSD
  os:
    - Windows 10/11 (64-bit)
    - Ubuntu 20.04 LTS
    - macOS 12.0 (Metal Performance Shaders)

recommended:
  gpu: NVIDIA RTX 4070 Ti (16GB VRAM)
  cpu: Intel i7-12700K / AMD Ryzen 7 5800X
  ram: 32GB DDR4
  storage: 100GB NVMe SSD
  os:
    - Ubuntu 22.04 LTS (best performance)
```

### 1.2 Installation Script

```bash
#!/bin/bash
# install_local.sh

echo "Interior Design AI Sketch Converter - Local Installation"

# Check system requirements
check_requirements() {
    # Check NVIDIA GPU
    if ! command -v nvidia-smi &> /dev/null; then
        echo "Warning: NVIDIA GPU not detected. CPU mode will be slower."
    else
        echo "GPU detected: $(nvidia-smi --query-gpu=name --format=csv,noheader)"
    fi
    
    # Check Python version
    python_version=$(python3 --version 2>&1 | awk '{print $2}')
    required_version="3.10.0"
    
    if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
        echo "Error: Python 3.10+ required. Current: $python_version"
        exit 1
    fi
}

# Install ComfyUI
install_comfyui() {
    echo "Installing ComfyUI..."
    
    # Clone ComfyUI
    git clone https://github.com/comfyanonymous/ComfyUI.git
    cd ComfyUI
    
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Install dependencies
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    pip install -r requirements.txt
    
    # Install custom nodes
    cd custom_nodes
    
    # ControlNet nodes
    git clone https://github.com/Fannovel16/comfyui_controlnet_aux.git
    cd comfyui_controlnet_aux && pip install -r requirements.txt && cd ..
    
    # Ollama integration
    git clone https://github.com/if-ai/ComfyUI-IF_AI_tools.git
    cd ComfyUI-IF_AI_tools && pip install -r requirements.txt && cd ..
    
    cd ../..
}

# Install Ollama
install_ollama() {
    echo "Installing Ollama..."
    
    # Download and install Ollama
    curl -fsSL https://ollama.ai/install.sh | sh
    
    # Pull required models
    ollama pull mistral:latest
    ollama pull llava:latest
    
    # Start Ollama service
    ollama serve &
}

# Download models
download_models() {
    echo "Downloading AI models..."
    
    mkdir -p models/checkpoints
    mkdir -p models/controlnet
    mkdir -p models/loras
    
    # Download Stable Diffusion XL
    wget -O models/checkpoints/sd_xl_base_1.0.safetensors \
        "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors"
    
    # Download ControlNet models
    wget -O models/controlnet/control_v11p_sd15_mlsd.pth \
        "https://huggingface.co/lllyasviel/control_v11p_sd15_mlsd/resolve/main/diffusion_pytorch_model.safetensors"
    
    wget -O models/controlnet/control_v11p_sd15_canny.pth \
        "https://huggingface.co/lllyasviel/control_v11p_sd15_canny/resolve/main/diffusion_pytorch_model.safetensors"
    
    # Download interior design LoRA (if available)
    # wget -O models/loras/interior_design_v1.safetensors "YOUR_LORA_URL"
}

# Main installation
main() {
    check_requirements
    install_comfyui
    install_ollama
    download_models
    
    echo "Installation complete! Run './start_local.sh' to start the application."
}

main
```

### 1.3 Configuration Files

```python
# config/local_settings.py

import os
from pathlib import Path

class LocalConfig:
    """Configuration for local ComfyUI deployment"""
    
    # Paths
    BASE_DIR = Path(__file__).parent.parent
    COMFYUI_DIR = BASE_DIR / "ComfyUI"
    MODELS_DIR = COMFYUI_DIR / "models"
    OUTPUT_DIR = COMFYUI_DIR / "output"
    TEMP_DIR = BASE_DIR / "temp"
    
    # Model settings
    MODELS = {
        "base": {
            "path": MODELS_DIR / "checkpoints" / "sd_xl_base_1.0.safetensors",
            "vae": "sdxl_vae.safetensors"
        },
        "controlnet": {
            "mlsd": MODELS_DIR / "controlnet" / "control_v11p_sd15_mlsd.pth",
            "canny": MODELS_DIR / "controlnet" / "control_v11p_sd15_canny.pth",
            "hed": MODELS_DIR / "controlnet" / "control_v11p_sd15_hed.pth"
        },
        "lora": {
            "interior_design": MODELS_DIR / "loras" / "interior_design_v1.safetensors",
            "architectural": MODELS_DIR / "loras" / "architectural_sketch_v1.safetensors"
        }
    }
    
    # ComfyUI settings
    COMFYUI_SETTINGS = {
        "listen": "127.0.0.1",
        "port": 8188,
        "cpu": False,
        "disable_xformers": False,
        "gpu_only": True,
        "highvram": False,
        "normalvram": True,
        "lowvram": False,
        "novram": False,
        "cpu_vae": False,
        "dont_print_server": False,
        "quick_test_for_ci": False,
        "windows_standalone_build": False,
        "disable_metadata": False,
        "multi_user": True
    }
    
    # Ollama settings
    OLLAMA_SETTINGS = {
        "host": "http://localhost:11434",
        "models": {
            "prompt_enhancer": "mistral:latest",
            "vision": "llava:latest"
        },
        "timeout": 30
    }
    
    # Processing settings
    PROCESSING = {
        "max_image_size": 1024,
        "default_steps": 20,
        "default_cfg": 7.5,
        "batch_size": 4,
        "cache_size": 100,  # Number of cached results
        "cache_ttl": 3600   # Cache time-to-live in seconds
    }
    
    # Style presets
    STYLE_PRESETS = {
        "concept": {
            "name": "Concept Sketch",
            "workflow": "workflows/concept_sketch.json",
            "lora_weight": 0.7,
            "controlnet_weight": 0.6
        },
        "technical": {
            "name": "Technical Drawing",
            "workflow": "workflows/technical_drawing.json",
            "lora_weight": 0.5,
            "controlnet_weight": 0.9
        },
        "presentation": {
            "name": "Presentation Sketch",
            "workflow": "workflows/presentation_sketch.json",
            "lora_weight": 0.6,
            "controlnet_weight": 0.75
        }
    }
```

### 1.4 Startup Script

```bash
#!/bin/bash
# start_local.sh

# Load configuration
source config/local.env

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama..."
    ollama serve &
    sleep 5
fi

# Start ComfyUI
echo "Starting ComfyUI..."
cd ComfyUI
source venv/bin/activate

# Set environment variables
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
export CUDA_VISIBLE_DEVICES=0

# Start with optimized settings
python main.py \
    --listen 127.0.0.1 \
    --port 8188 \
    --normalvram \
    --use-pytorch-cross-attention \
    --disable-smart-memory \
    &

# Wait for ComfyUI to start
sleep 10

# Start the web interface
cd ..
echo "Starting web interface..."
python -m http.server 8080 --directory web &

echo "Interior Design AI Sketch Converter is running!"
echo "ComfyUI: http://localhost:8188"
echo "Web Interface: http://localhost:8080"
```

## 2. Cloud Deployment (RunPod)

### 2.1 Docker Configuration

```dockerfile
# Dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV CUDA_HOME=/usr/local/cuda

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    git \
    wget \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip3 install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download models
RUN python3 scripts/download_models.py

# Expose port
EXPOSE 8000

# Set up RunPod handler
COPY runpod_handler.py /app/

# Start command
CMD ["python3", "-u", "runpod_handler.py"]
```

### 2.2 RunPod Configuration

```python
# runpod_config.py

class RunPodConfig:
    """RunPod serverless configuration"""
    
    # RunPod settings
    RUNPOD_API_KEY = os.environ.get("RUNPOD_API_KEY")
    RUNPOD_ENDPOINT_ID = os.environ.get("RUNPOD_ENDPOINT_ID")
    
    # GPU configuration
    GPU_CONFIG = {
        "gpu_type": "NVIDIA A5000",  # or "NVIDIA A40" for more VRAM
        "gpu_count": 1,
        "container_disk_in_gb": 20,
        "volume_in_gb": 50
    }
    
    # Scaling configuration
    SCALING = {
        "min_workers": 0,  # Scale to zero when idle
        "max_workers": 10,
        "idle_timeout": 60,  # Seconds before scaling down
        "max_pending_requests": 100
    }
    
    # Request handling
    REQUEST_CONFIG = {
        "timeout": 120,  # 2 minutes max per request
        "max_retries": 3,
        "retry_delay": 5
    }
    
    # Model caching
    CACHE_CONFIG = {
        "cache_models": True,
        "cache_dir": "/workspace/cache",
        "max_cache_size_gb": 40
    }
```

### 2.3 Deployment Script

```python
# deploy_runpod.py

import requests
import json
import os
from typing import Dict, Any

class RunPodDeployer:
    """Deploy to RunPod serverless"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.runpod.io/v2"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def create_template(self) -> str:
        """Create a new template for the sketch converter"""
        
        template_config = {
            "name": "interior-sketch-converter",
            "imageName": "your-dockerhub/interior-sketch:latest",
            "dockerArgs": "",
            "containerDiskInGb": 20,
            "volumeInGb": 50,
            "volumeMountPath": "/workspace",
            "env": [
                {"key": "MODEL_PATH", "value": "/workspace/models"},
                {"key": "CACHE_PATH", "value": "/workspace/cache"}
            ],
            "serverless": {
                "gpuIds": "NVIDIA A5000",
                "minWorkers": 0,
                "maxWorkers": 10,
                "defaultTimeout": 120,
                "workerIdleTimeout": 60
            }
        }
        
        response = requests.post(
            f"{self.base_url}/templates",
            headers=self.headers,
            json=template_config
        )
        
        if response.status_code == 201:
            return response.json()["id"]
        else:
            raise Exception(f"Failed to create template: {response.text}")
    
    def create_endpoint(self, template_id: str) -> str:
        """Create a serverless endpoint"""
        
        endpoint_config = {
            "name": "interior-sketch-api",
            "templateId": template_id,
            "gpuIds": "NVIDIA A5000",
            "networkVolumeId": None,  # Optional persistent volume
            "locations": ["US-NJ", "US-CA"],  # Multi-region
            "idleTimeout": 60,
            "scalerType": "QUEUE_DEPTH",
            "scalerConfig": {
                "queueDepth": 1,
                "minWorkers": 0,
                "maxWorkers": 10
            }
        }
        
        response = requests.post(
            f"{self.base_url}/endpoints",
            headers=self.headers,
            json=endpoint_config
        )
        
        if response.status_code == 201:
            endpoint = response.json()
            print(f"Endpoint created: {endpoint['id']}")
            print(f"Endpoint URL: {endpoint['inferenceURL']}")
            return endpoint['id']
        else:
            raise Exception(f"Failed to create endpoint: {response.text}")
    
    def test_endpoint(self, endpoint_id: str):
        """Test the deployed endpoint"""
        
        test_payload = {
            "input": {
                "image": "base64_encoded_test_image",
                "style": "concept",
                "seed": 42
            }
        }
        
        response = requests.post(
            f"{self.base_url}/endpoints/{endpoint_id}/run",
            headers=self.headers,
            json=test_payload
        )
        
        if response.status_code == 200:
            job_id = response.json()["id"]
            print(f"Test job submitted: {job_id}")
            return job_id
        else:
            raise Exception(f"Test failed: {response.text}")

# Deployment execution
if __name__ == "__main__":
    deployer = RunPodDeployer(os.environ["RUNPOD_API_KEY"])
    
    # Create template
    template_id = deployer.create_template()
    print(f"Template created: {template_id}")
    
    # Create endpoint
    endpoint_id = deployer.create_endpoint(template_id)
    
    # Test deployment
    deployer.test_endpoint(endpoint_id)
```

## 3. Production Optimization

### 3.1 Performance Monitoring

```python
# monitoring.py

import time
import psutil
import GPUtil
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import logging

class PerformanceMonitor:
    """Monitor system performance and model metrics"""
    
    def __init__(self):
        # Prometheus metrics
        self.request_count = Counter(
            'sketch_requests_total',
            'Total number of sketch conversion requests',
            ['style', 'status']
        )
        
        self.request_duration = Histogram(
            'sketch_request_duration_seconds',
            'Time spent processing sketch requests',
            ['style']
        )
        
        self.gpu_usage = Gauge(
            'gpu_usage_percent',
            'GPU usage percentage'
        )
        
        self.gpu_memory = Gauge(
            'gpu_memory_used_mb',
            'GPU memory usage in MB'
        )
        
        self.cache_hits = Counter(
            'cache_hits_total',
            'Number of cache hits'
        )
        
        self.queue_size = Gauge(
            'request_queue_size',
            'Current size of request queue'
        )
        
        # Start metrics server
        start_http_server(8090)
        
        # Setup logging
        self.setup_logging()
    
    def setup_logging(self):
        """Configure structured logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def log_request(self, style: str, duration: float, success: bool):
        """Log request metrics"""
        status = "success" if success else "failure"
        self.request_count.labels(style=style, status=status).inc()
        self.request_duration.labels(style=style).observe(duration)
        
        self.logger.info(
            f"Request processed",
            extra={
                "style": style,
                "duration": duration,
                "status": status
            }
        )
    
    def update_gpu_metrics(self):
        """Update GPU usage metrics"""
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]
                self.gpu_usage.set(gpu.load * 100)
                self.gpu_memory.set(gpu.memoryUsed)
        except Exception as e:
            self.logger.error(f"Failed to get GPU metrics: {e}")
    
    def monitor_system_health(self):
        """Monitor overall system health"""
        health_status = {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "gpu_available": len(GPUtil.getGPUs()) > 0
        }
        
        # Alert if resources are constrained
        if health_status["cpu_percent"] > 90:
            self.logger.warning("High CPU usage detected")
        
        if health_status["memory_percent"] > 90:
            self.logger.warning("High memory usage detected")
        
        return health_status
```

### 3.2 Caching Strategy

```python
# cache_manager.py

import hashlib
import json
from typing import Optional, Dict, Any
import redis
from PIL import Image
import io
import base64

class CacheManager:
    """Intelligent caching for sketch conversions"""
    
    def __init__(self, redis_host="localhost", redis_port=6379):
        self.redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=False
        )
        self.ttl = 3600  # 1 hour default TTL
    
    def generate_cache_key(self, image_hash: str, params: Dict[str, Any]) -> str:
        """Generate unique cache key"""
        # Sort params for consistent hashing
        sorted_params = json.dumps(params, sort_keys=True)
        combined = f"{image_hash}:{sorted_params}"
        
        return hashlib.sha256(combined.encode()).hexdigest()
    
    def get_cached_sketch(self, image: Image.Image, params: Dict[str, Any]) -> Optional[Image.Image]:
        """Retrieve cached sketch if available"""
        # Generate image hash
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='PNG')
        image_hash = hashlib.md5(image_bytes.getvalue()).hexdigest()
        
        # Generate cache key
        cache_key = self.generate_cache_key(image_hash, params)
        
        # Try to get from cache
        cached_data = self.redis_client.get(cache_key)
        
        if cached_data:
            # Decode base64 to image
            image_data = base64.b64decode(cached_data)
            return Image.open(io.BytesIO(image_data))
        
        return None
    
    def cache_sketch(self, 
                    original_image: Image.Image,
                    sketch: Image.Image,
                    params: Dict[str, Any],
                    ttl: Optional[int] = None):
        """Cache generated sketch"""
        # Generate image hash
        image_bytes = io.BytesIO()
        original_image.save(image_bytes, format='PNG')
        image_hash = hashlib.md5(image_bytes.getvalue()).hexdigest()
        
        # Generate cache key
        cache_key = self.generate_cache_key(image_hash, params)
        
        # Convert sketch to base64
        sketch_bytes = io.BytesIO()
        sketch.save(sketch_bytes, format='PNG')
        sketch_base64 = base64.b64encode(sketch_bytes.getvalue())
        
        # Store in Redis with TTL
        self.redis_client.setex(
            cache_key,
            ttl or self.ttl,
            sketch_base64
        )
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        info = self.redis_client.info()
        
        return {
            "total_keys": self.redis_client.dbsize(),
            "used_memory_mb": info["used_memory"] / 1024 / 1024,
            "hit_rate": info.get("keyspace_hits", 0) / max(info.get("keyspace_misses", 0) + info.get("keyspace_hits", 0), 1),
            "evicted_keys": info.get("evicted_keys", 0)
        }
    
    def clear_old_entries(self, max_age_hours: int = 24):
        """Clear cache entries older than specified hours"""
        # Redis automatically handles TTL expiration
        # This method can be used for manual cleanup if needed
        pass
```

### 3.3 Load Balancing Configuration

```nginx
# nginx.conf

upstream sketch_api {
    least_conn;
    server 127.0.0.1:8001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8002 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8003 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8004 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name sketch.yourcompany.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sketch.yourcompany.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/sketch.crt;
    ssl_certificate_key /etc/ssl/private/sketch.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Request size limit for image uploads
    client_max_body_size 50M;
    
    # Timeouts for long-running conversions
    proxy_read_timeout 300s;
    proxy_connect_timeout 30s;
    proxy_send_timeout 300s;
    
    # API endpoints
    location /api/ {
        proxy_pass http://sketch_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Enable request buffering for large uploads
        proxy_request_buffering on;
        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
    }
    
    # Static files
    location / {
        root /var/www/sketch-converter;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 4. Security Configuration

### 4.1 API Authentication

```python
# auth.py

from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta
import os

class AuthManager:
    """Handle API authentication"""
    
    def __init__(self):
        self.secret_key = os.environ.get("JWT_SECRET_KEY", "your-secret-key")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        
        self.security = HTTPBearer()
    
    def create_access_token(self, data: dict):
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, credentials: HTTPAuthorizationCredentials = Security(HTTPBearer())):
        """Verify JWT token"""
        token = credentials.credentials
        
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
```

This deployment and configuration guide provides comprehensive instructions for both local and cloud deployment of the Interior Design AI Sketch Converter.