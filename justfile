set shell := ["zsh", "-cu"]

default:
    @just --list

dev host="127.0.0.1" port="5173":
    npm run dev -- --host {{host}} --port {{port}} --strictPort

build:
    npm run build

test:
    npm run test -- --passWithNoTests

preview host="127.0.0.1" port="4173":
    npm run preview -- --host {{host}} --port {{port}} --strictPort
