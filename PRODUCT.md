# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers in collaborating Labyrinth project teams implementing game clients, game servers, and directory-server integrations.

## Product Purpose

A German-language reference for the REST directory service and the WebSocket game protocol. Readers find operations, understand direction and rules, inspect schemas, and copy complete JSON examples. A short quickstart provides orientation; reference remains the primary job, confirmed by the user on 25 October 2026.

## Operating Context

Static documentation published from this Git repository through GitHub Pages. Teams import OpenAPI and AsyncAPI YAML contracts and consult the browser reference while implementing their own services.

## Capabilities and Constraints

Keep REST Swagger authorization and request execution, YAML downloads, deep links, message search, separate directional message entries, error-code meanings, copyable examples, schema details, and a collapsible navigation that returns its width to content. REST describes only the directory server; game communication uses WebSocket. Contracts and validated examples are authoritative; the redesign must not change protocol semantics or invent live service availability. Preserve mobile readability and keyboard navigation. No large promotional banner on reference pages.

## Brand Commitments

Name: Labyrinth. Language: German. A fundamental visual redesign is authorized; no fixed palette or logo asset was specified.

## Evidence on Hand

api/openapi.yaml, api/asyncapi.yaml, api/README.md, and the existing static site. The contracts are version 2.0.0; AsyncAPI format is 3.0.0, OpenAPI format is 3.1.0.

## Product Principles

- Put operation lookup before promotional content.
- Keep examples and explanations adjacent to the operation they describe.
- Make transport, direction, authentication, and version explicit.
- Derive reference content from validated contracts.
