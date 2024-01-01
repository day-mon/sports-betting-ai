import asyncio
import httpx
import os

client = httpx.AsyncClient(
    base_url=os.getenv('API_HOST', 'http://localhost:8000/api/v1/')
)


async def main():
    response = await client.get('ping')
    response.raise_for_status()
    print("Good to go!")


if __name__ == "__main__":
    asyncio.run(main())
