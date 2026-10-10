window.ui = SwaggerUIBundle({
  url: '../specs/openapi.yaml',
  dom_id: '#swagger-ui',
  deepLinking: true,
  displayRequestDuration: true,
  docExpansion: 'list',
  validatorUrl: null,
  presets: [SwaggerUIBundle.presets.apis],
});
