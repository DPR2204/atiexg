# Investigación rápida de pagos recurrentes

## Acceso a documentación externa

Intenté abrir la documentación compartida para entender la API y su soporte de cobros recurrentes, pero la URL devolvió un **403** desde el entorno. Esto limita el análisis específico de ese proveedor.

```
curl -L 'https://documenter.getpostman.com/view/10340859/2sA2rFQf5R' | head -n 40
curl: (56) CONNECT tunnel failed, response 403
```

## Consideraciones generales para cobros recurrentes en esta app

- Requerirías un backend (o serverless) para crear planes/checkout, manejar webhooks y almacenar IDs de cliente/suscripción.
- La app podría iniciar el checkout y luego validar estado de pago con el backend antes de confirmar reserva.
- Para cobros recurrentes, es clave:
  - Gestión de suscripciones (crear, cancelar, pausar).
  - Webhooks de eventos (pago exitoso, fallo, renovaciones).
  - Seguridad: no exponer llaves secretas en el front-end.

