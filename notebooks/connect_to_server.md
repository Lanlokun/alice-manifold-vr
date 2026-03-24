# Campus Server Connection Guide

## Option 1: SSH + Remote Jupyter (Recommended)

### Step 1: Connect to Server
```bash
ssh your_username@campus.server.edu
```

### Step 2: Start Jupyter on Server
```bash
# Load modules if needed
module load python/3.9
module load jupyter

# Start Jupyter with remote access
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser
```

### Step 3: SSH Port Forwarding (Local Terminal)
```bash
# Forward server port to local machine
ssh -N -L 8888:localhost:8888 your_username@campus.server.edu
```

### Step 4: Access in Browser
- Open: `http://localhost:8888`
- Use token from server Jupyter startup

---

## Option 2: VS Code Remote SSH

### Step 1: Install VS Code Extension
- Install "Remote - SSH" extension

### Step 2: Add Server
1. Press `Ctrl+Shift+P`
2. Type "Remote-SSH: Open Configuration File"
3. Add:
```json
Host campus-server
    HostName campus.server.edu
    User your_username
    Port 22
```

### Step 3: Connect and Open
1. `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
2. Select "campus-server"
3. Open notebook folder
4. Run in server's resources

---

## Option 3: Upload and Run via HPC

### Step 1: Upload Files
```bash
scp -r /path/to/alice-manifold-vr your_username@campus.server.edu:~/
```

### Step 2: Submit as Job (if HPC)
```bash
# Create job script
cat > analysis_job.sh << EOF
#!/bin/bash
#SBATCH --job-name=alice_analysis
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --mem=32G
#SBATCH --time=04:00:00

module load python/3.9
cd alice-manifold-vr/notebooks
jupyter lab --ip=0.0.0.0 --port=8888
EOF

# Submit job
sbatch analysis_job.sh
```

---

## Testing Connection

### Check Server Resources
```python
import psutil
import numpy as np

print(f"Available CPU cores: {psutil.cpu_count()}")
print(f"Available memory: {psutil.virtual_memory().total / 1024**3:.1f} GB")
print(f"Available disk: {psutil.disk_usage('/').free / 1024**3:.1f} GB")
```

### Test Large Data Processing
```python
# Test if server can handle your data
try:
    # This will work on server with more resources
    import numpy as np
    large_array = np.zeros((1000, 500000))  # ~4GB
    print("✅ Server can handle large arrays")
except MemoryError:
    print("❌ Still memory limited")
```

---

## Recommended Workflow

1. **Connect via SSH** to campus server
2. **Transfer notebook** to server
3. **Install dependencies** on server
4. **Run analysis** using server resources
5. **Download results** back to local machine

This gives you access to:
- More CPU cores
- More RAM (32GB+)
- Faster processing
- No local machine crashes
