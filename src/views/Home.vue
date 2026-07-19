<!-- src/views/Home.vue -->
<template>
  <div class="welcome-container">
    <header class="hero">
      <h1>Bienvenido a <span class="brand">RoleDex</span></h1>
      <p class="subtitle">El fichero para tus campañas de juego de rol y hojas de personajes.</p>
      
      <div class="actions">
        <router-link to="/login" class="btn btn-primary">Iniciar Sesión</router-link>
        <router-link to="/register" class="btn btn-secondary">Registrarse</router-link>
      </div>
    </header>

    <hr class="divider" />

    <section class="features">
      <h2>¿Qué puedes hacer en RoleDex?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">📜</div>
          <h3>Fichas en Vivo</h3>
          <p>Crea y edita tus personajes. Los cambios de vida, inventario y estadísticas se sincronizan al instante.</p>
        </div>

        <div class="feature-card">
          <div class="icon">🐉</div>
          <h3>Gestión de Campañas</h3>
          <p>Como Director de Juego, crea campañas y comparte un código único para que tus jugadores se unan en segundos.</p>
        </div>

        <div class="feature-card">
          <div class="icon">🎲</div>
          <h3>Dados Virtuales</h3>
          <p>Lanza dados de 4, 6, 20 o 100 caras directamente desde la plataforma con resultados transparentes para todos.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.welcome-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: system-ui, -apple-system, sans-serif;
  text-align: center;
  color: #f3f4f6;
}

.hero {
  padding: 60px 20px;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 10px;
  color: #ffffff;
}

.brand {
  color: #ff4757; /* Un rojo vivo estilo RPG/Dragón */
  font-weight: bold;
}

.subtitle {
  font-size: 1.25rem;
  color: #9ca3af;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-primary {
  background-color: #ff4757;
  color: white;
}

.btn-primary:hover {
  background-color: #e84118;
}

.btn-secondary {
  background-color: #2f3542;
  color: white;
  border: 1px solid #57606f;
}

.btn-secondary:hover {
  background-color: #57606f;
}

.divider {
  border: 0;
  height: 1px;
  background: #2f3542;
  margin: 40px 0;
}

.features h2 {
  font-size: 2rem;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card {
  background: #1e272e;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #2f3542;
  text-align: left;
}

.feature-card .icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #ffffff;
}

.feature-card p {
  color: #a4b0be;
  line-height: 1.6;
}
</style>