def handler(request): 
    headers = {
        'Content-Type': 'text/plain'
    }

    return ('If you can read this, then all is well!', 200, headers)
    