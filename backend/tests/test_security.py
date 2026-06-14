from __future__ import annotations

from app.core.security import create_access_token, decode_token


def test_jwt_roundtrip():
    token = create_access_token("user-123", extra={"email": "a@b.com"})
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["email"] == "a@b.com"
