build:
	docker build -t fullstacknotes-site .

dev:
	docker run -p 8080:4321 -v "$$(pwd):/app" -v /app/node_modules fullstacknotes-site

stop:
	docker stop $$(docker ps -q --filter ancestor=fullstacknotes-site)
