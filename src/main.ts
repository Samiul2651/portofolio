import './style.css';

// Step 1 placeholder. Step 6 replaces this with the real pages from the mockup,
// and step 4 plugs the retrieval engine into the chat panel.
const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <main class="layout">
      <section class="intro">
        <h1>Ishtiaq Samiul</h1>
        <p>Backend Software Engineer — Event-Driven Systems · C#/.NET</p>
        <p class="muted">Site under construction. The "Ask Samiul" chatbot is coming soon.</p>
      </section>
    </main>
  `;
}
