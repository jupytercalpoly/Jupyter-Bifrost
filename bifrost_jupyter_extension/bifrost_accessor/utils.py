# import bifrost_jupyter_extension
# from functools import wraps

# def with_bifrost_extension(func, extension='bifrost', logo=False):
#     """If biforst extension is not loaded, load before calling function"""
#     @wraps(func)
#     def wrapper(*args, **kwargs):
#         print(dir(bifrost_jupyter_extension))
#         if extension and not getattr(bifrost_jupyter_extension.nbextension.extension, '_loaded', False):
#             bifrost_jupyter_extension.nbextension.extension(extension, logo=logo)
#         return func(*args, **kwargs)
#     return wrapper