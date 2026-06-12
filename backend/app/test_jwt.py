from jose import jwt

SECRET_KEY = "openwork-ai-secret-key"

token = input("Token: ")

print(
    jwt.decode(
        token,
        SECRET_KEY,
        algorithms=["HS256"]
    )
)
