# Backend Spring Boot - Plataforma de Reservas

Backend nuevo, construido leyendo directamente lo que el frontend espera
(`frontend/src/services/*.ts` y `frontend/src/types/*.ts`), no una migración del
backend Next.js que venía en el .rar (ese se puede ignorar/borrar).

Reemplaza por completo al backend anterior (Next.js + cookie de sesión). Este usa
JWT en el body de la respuesta, que es literalmente lo que `apiClient.ts` del
frontend ya esperaba (`Authorization: Bearer <token>` desde `localStorage`).

## Stack
- Spring Boot 3.5.16, Java 21, Maven
- Spring Web, Spring Data JPA, Spring Security (JWT propio, sin sesiones), Bean Validation
- PostgreSQL
- jjwt 0.13.0 para firmar/verificar JWT

## Como correrlo

1. Crea la base de datos:
   ```
   createdb reservas_db
   ```
2. Copia `.env.example` como referencia y define esas variables en tu entorno
   (Spring Boot no lee `.env`, son variables de entorno reales: export, IntelliJ
   run config, docker-compose, etc). Como mínimo:
   - `DATABASE_URL` (formato JDBC: `jdbc:postgresql://localhost:5432/reservas_db`)
   - `DATABASE_USER`, `DATABASE_PASSWORD`
   - `JWT_SECRET` (mínimo 32 caracteres)
3. Arranca:
   ```
   mvn spring-boot:run
   ```
   Por defecto queda en `http://localhost:8080/api` (context-path `/api`).

Las tablas se crean solas con `ddl-auto=update` (comodo para Sprint 1; para
producción cambia a `validate` + Flyway/Liquibase).

No pude compilar esto en el sandbox porque el proxy de red aquí no tiene acceso
a Maven Central (solo a npm/pypi/crates/github). Revisa que compile con
`mvn -q compile` en tu maquina antes de darlo por bueno.

## Conectar el frontend

En `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_USE_MOCK=false
```
Con eso, `apiClient.ts` deja de usar los mocks de localStorage y llama a este
backend. No hace falta tocar nada mas del frontend: las rutas, formas de
request/response y el casing de `role` (`CLIENT`/`PROVIDER`) ya están hechos
para calzar exactamente con lo que el frontend manda y espera.

## Endpoints implementados

Solo los que el frontend realmente llama (busqué cada uno en
`frontend/src/services/*.ts` antes de escribir el controller):

| Método | Ruta | Auth | Uso |
|---|---|---|---|
| POST | `/auth/login` | - | login |
| POST | `/auth/register/client` | - | registro cliente |
| POST | `/auth/register/provider` | - | registro proveedor |
| GET | `/services?category=&search=` | - | catálogo (solo activos) |
| GET | `/services/provider/{providerId}` | - | servicios de un proveedor (incluye inactivos) |
| POST | `/services` | Bearer, rol PROVIDER | crear servicio |
| GET | `/appointments/client/{clientId}` | Bearer, debe ser el mismo id | citas de un cliente |
| GET | `/appointments/provider/{providerId}` | Bearer, debe ser el mismo id | citas de un proveedor |
| POST | `/appointments` | Bearer | crear cita |
| PUT | `/appointments/{id}` | Bearer, cliente o proveedor de esa cita | reprogramar (pone status CONFIRMED) |
| DELETE | `/appointments/{id}` | Bearer, cliente o proveedor de esa cita | cancelar (status CANCELLED) |

`forgot-password`, `reset-password`, `logout` y `/services/categories` no están
porque el frontend actual no los llama desde ninguna pantalla (verificado con
grep sobre `src/`). Si agregas esas pantallas, son fáciles de sumar con el mismo
patrón (controller + DTO + excepción de negocio).

## Decisiones que tomé y por qué

- **Un solo endpoint de registro dividido en dos rutas** (`/register/client`,
  `/register/provider`) en vez de uno unificado con campo `role`: es lo que
  `authService.ts` del frontend ya llama textualmente.
- **`role` en mayúsculas** (`CLIENT`/`PROVIDER`): así está tipado en
  `frontend/src/types/auth.ts`. Evita el mismatch de casing que tenía el
  backend Next.js original.
- **Token en el body, no cookie**: `apiClient.ts` ya arma
  `Authorization: Bearer` desde `localStorage`; usar cookies httpOnly hubiera
  exigido cambiar el frontend y manejar CORS con credenciales.
- **`GET /services` solo devuelve el array**, no `{ services: [...] }`: el
  frontend hace `apiClient.get<Service[]>(...)` esperando un array directo.
- **Appointments guardan una copia de nombre/precio/duración** del servicio al
  momento de crear la cita (no una referencia viva): así se comporta el mock
  del frontend, y evita que cambiar el precio de un servicio altere citas ya
  agendadas.
- **Autorización por dueño del recurso** en `/appointments/**` (un cliente solo
  ve sus propias citas, un proveedor las suyas): el frontend no lo exige
  explícitamente, pero sin esto cualquier usuario autenticado podría leer las
  citas de cualquier otro con solo cambiar el id en la URL.
