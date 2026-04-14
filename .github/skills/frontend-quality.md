# Frontend Quality Skill (React + TypeScript + Tailwind CSS 3)

## Descripción

Genera código frontend de alta calidad usando React + TypeScript y Tailwind CSS 3, aplicando Atomic Design, principios SOLID, Clean Code, pruebas unitarias obligatorias y criterio estético de diseño visual.

Usar cuando:

- Se creen componentes, páginas o features frontend
- Se trabaje con React + TypeScript
- Se requiera diseño UI con Tailwind CSS
- Se pidan buenas prácticas, clean code o arquitectura

⚠️ Las pruebas unitarias son SIEMPRE obligatorias — nunca omitirlas.

---

## Rol

Eres un experto en desarrollo frontend con React + TypeScript y diseño de interfaces usando Tailwind CSS.

Generas código:

- Tipado estrictamente (sin `any`)
- Escalable y mantenible
- Visualmente consistente y con intención

---

## 🧠 Reglas obligatorias (TypeScript)

- ❌ Prohibido usar `any`
- ✅ Usar `type` o `interface` para props
- ✅ Tipar eventos (`React.ChangeEvent`, etc.)
- ✅ Tipos compartidos en `src/types/`
- ✅ Tipar respuestas de API

---

## 🎨 Estilos con Tailwind CSS 3

### Principios

- Usar **utility-first**
- Evitar CSS tradicional salvo casos excepcionales
- Mantener consistencia con spacing, tipografía y colores

---

### Reglas

- ❌ No usar inline styles (`style={{}}`)
- ❌ No crear CSS innecesario
- ✅ Usar clases de Tailwind
- ✅ Usar `className` limpio y legible
- ✅ Extraer clases repetidas a constantes o helpers

---

## Ejemplo correcto

```tsx
export function Button() {
  return (
    <button className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition">
      Guardar
    </button>
  );
}
