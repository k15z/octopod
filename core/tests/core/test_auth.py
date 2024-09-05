from octopod.core.auth import create_token, decode_user_token, TokenData, TokenKind


def test_create_token():
    data = TokenData(id="123e4567-e89b-12d3-a456-426614174000", kind=TokenKind.User)
    token = create_token(data)
    token_data = decode_user_token(token)
    assert token_data.id == data.id
    assert token_data.kind == data.kind
