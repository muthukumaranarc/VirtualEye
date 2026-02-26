from .camera_execution_engine import CameraExecutionEngine

# Global engine instance
engine = CameraExecutionEngine()

def start_camera_engine(app):
    """Method to be called from app factory or startup script."""
    print(f"[Controller] Requesting engine start for app {app}", flush=True)
    engine.start(app)
