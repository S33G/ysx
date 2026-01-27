.PHONY: install build test clean publish help bootstrap

help:
	@echo "YSX React Monorepo - Available targets:"
	@echo "  make install    - Install all dependencies"
	@echo "  make bootstrap  - Bootstrap packages with Lerna"
	@echo "  make build      - Build all packages"
	@echo "  make test       - Run tests for all packages"
	@echo "  make clean      - Clean all build artifacts and node_modules"
	@echo "  make publish    - Publish packages to NPM"
	@echo "  make example    - Build example webpack app"

install:
	npm install

bootstrap: install
	npx lerna bootstrap

build:
	npm run build --workspaces

test:
	npm run test --workspaces --if-present

clean:
	rm -rf packages/*/node_modules
	rm -rf examples/*/node_modules
	rm -rf node_modules
	rm -rf packages/*/dist
	rm -rf examples/*/dist
	@echo "Cleaned all build artifacts and dependencies"

publish: test build
	npx lerna publish

example:
	cd examples/webpack-app && npm run build

dev-example:
	cd examples/webpack-app && npm start

all: install build test
