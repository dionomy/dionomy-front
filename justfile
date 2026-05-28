set shell := ["zsh", "-cu"]

default:
    @just --list

dev host="127.0.0.1" port="5173":
    asdf exec npm run dev -- --host {{host}} --port {{port}} --strictPort

build:
    asdf exec npm run build

test:
    asdf exec npm run test -- --passWithNoTests

preview host="127.0.0.1" port="4173":
    asdf exec npm run preview -- --host {{host}} --port {{port}} --strictPort
