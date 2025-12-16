"""Custom middleware for debugging."""

class DebugMiddleware:
    """Middleware to debug all requests."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log before processing
        if request.method == 'POST':
            print(f"\n[MIDDLEWARE] {request.method} {request.path}")
            print(f"[MIDDLEWARE] Authorization header: {request.headers.get('Authorization', 'None')}")
            print(f"[MIDDLEWARE] User before auth: {getattr(request, 'user', 'Not set yet')}")
        
        response = self.get_response(request)
        
        # Log after processing
        if request.method == 'POST':
            print(f"[MIDDLEWARE] User after auth: {getattr(request, 'user', 'Not set')}")
            print(f"[MIDDLEWARE] Response status: {response.status_code}\n")
        
        return response
