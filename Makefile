.PHONY: help install dev build preview clean certs up down logs

IMAGE_NAME  := kaonix-blog
CONTAINER   := kaonix-blog
PORT        := 80
TLS_PORT    := 443
DOMAIN      := doli.kaonix.local

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start dev server (http://localhost:4321)
	npm run dev

build: ## Build static site to dist/
	npm run build

preview: ## Preview production build locally
	npm run preview

clean: ## Remove build output
	rm -rf dist .astro

certs: ## Generate local TLS certificates with mkcert
	mkcert -install
	mkdir -p certs
	mkcert -cert-file certs/kaonix.pem -key-file certs/kaonix-key.pem \
		localhost 127.0.0.1 ::1 $(DOMAIN)
	@echo ""
	@echo "Add this line to /etc/hosts (requires sudo):"
	@echo "  127.0.0.1 $(DOMAIN)"

up: ## Start container with TLS (https://$(DOMAIN))
	docker compose up -d --build

down: ## Stop and remove the container
	docker compose down

logs: ## Follow container logs
	docker compose logs -f

docker-build: ## Build the Docker image only
	docker build -t $(IMAGE_NAME) .

docker-stop: ## Stop and remove legacy container
	-docker stop $(CONTAINER) && docker rm $(CONTAINER)
