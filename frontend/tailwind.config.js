/** @type {import('tailwindcss').Config} */
module.exports = {
 content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'oscuro': '#0F3D56',
        'botones': '#059669', // El Verde exacto de tus botones
        'fondo': '#f3f4f6',   // El Gris claro de fondo
        'alz-accent': '#3b82f6',  // Azul brillante extra
      },
    },
  },
  plugins: [],
}
