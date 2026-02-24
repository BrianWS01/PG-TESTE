import './style.css'

/* =============================================
   BARBERS DATA — 4 barbeiros
   ============================================= */
const barbers = [
  {
    name: "Ricardo 'The Blade'",
    role: "Especialista em Fade e Navalha",
    exp: "12 anos",
    desc: "Mestre do degradê e navalha. Formou mais de 200 alunos e é referência nacional em técnicas de fade de precisão.",
    img: "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=600&auto=format&fit=crop",
    pip: "♠"
  },
  {
    name: "Alex Urban",
    role: "Visagismo Masculino",
    exp: "8 anos",
    desc: "Pioneiro em técnicas afro e barboterapia. Especialista em visagismo e cortes personalizados para cada rosto.",
    img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=600&auto=format&fit=crop",
    pip: "♥"
  },
  {
    name: "Bruno Gold",
    role: "Barba e Estilo Clássico",
    exp: "10 anos",
    desc: "Referência em cortes clássicos e modernos de alto padrão. Design de barba e hidratação profissional.",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
    pip: "♦"
  },
  {
    name: "Diego Ferreira",
    role: "Estilista Sênior & Colorist",
    exp: "6 anos",
    desc: "Especialista em coloração masculina e cortes modernos de alto padrão. Referência em tendências internacionais.",
    img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop",
    pip: "♣"
  }
];

/* =============================================
   RENDER BARBERS — PLAYING CARD DECK
   (cards start face-up, click = 2 spins + focus)
   ============================================= */
function renderBarbers() {
  const deck = document.getElementById('barbersDeck');
  if (!deck) return;

  deck.innerHTML = barbers.map((b, i) => `
    <div class="card-slot" data-index="${i}" role="button"
         aria-label="Focar no barbeiro ${b.name}" tabindex="0">
      <div class="card-inner">

        <!-- CARD FRONT (visible by default — face up) -->
        <div class="card-front">
          <img class="card-front-img" src="${b.img}" alt="${b.name}" loading="lazy">
          <div class="card-front-info">
            <h3>${b.name}</h3>
            <span class="card-role">${b.role} · ${b.exp}</span>
            <p class="card-desc">${b.desc}</p>
          </div>
          <p class="card-close-hint">Clique para focar</p>
        </div>

        <!-- CARD BACK (hidden behind by default) -->
        <div class="card-back">
          <span class="card-pip tl">${b.pip}<br>${b.exp}</span>
          <span class="card-pip br">${b.pip}<br>${b.exp}</span>
          <span class="card-back-icon">✂️</span>
          <div class="card-back-logo">Street<br>Barbershop</div>
        </div>

      </div>
    </div>
  `).join('');

  // Attach listeners
  deck.querySelectorAll('.card-slot').forEach(slot => {
    slot.addEventListener('click', () => handleCardClick(slot));
    slot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(slot); }
    });
  });
}

/**
 * Observe newly injected elements for scroll reveal
 */
function observeNewElements(observer) {
  document.querySelectorAll('.reveal:not([data-observed])').forEach(el => {
    el.setAttribute('data-observed', 'true');
    observer.observe(el);
  });
}

/**
 * Click handler:
 *  - If NOT active: close others, then spin 2x (720deg) + rise to focus
 *  - If already active: unfocus and return to fan position
 */
function handleCardClick(slot) {
  const isActive = slot.classList.contains('active');

  // Close any currently active card instantly
  document.querySelectorAll('.card-slot.active').forEach(s => {
    s.classList.remove('active');
    const inner = s.querySelector('.card-inner');
    // Kill animation via inline style then clear it
    inner.style.animation = 'none';
    inner.offsetHeight; // reflow
    inner.style.animation = '';
    inner.style.transform = '';
  });

  if (isActive) return; // was already active — just close

  // Rise the slot
  slot.classList.add('active');

  // Spin 2 full rotations via inline animation (avoids CSS specificity issues)
  const inner = slot.querySelector('.card-inner');
  inner.style.animation = 'none';
  inner.offsetHeight; // force reflow so browser restarts animation
  inner.style.animation = 'cardSpin2x 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards';

  // After spin ends, clear so card rests face-up (360deg = 0deg visually)
  inner.addEventListener('animationend', () => {
    inner.style.animation = '';
    inner.style.transform = 'rotateY(360deg)'; // lock at same visual = face-up
  }, { once: true });
}


/* =============================================
   SCROLL REVEAL
   ============================================= */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('section-title')) {
          entry.target.classList.add('title-visible');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => {
    el.setAttribute('data-observed', 'true');
    observer.observe(el);
  });

  document.querySelectorAll('.reveal-stagger').forEach(container => {
    Array.from(container.children).forEach(child => {
      if (!child.classList.contains('reveal')) {
        child.classList.add('reveal');
      }
      child.setAttribute('data-observed', 'true');
      observer.observe(child);
    });
  });

  document.querySelectorAll('.section-title').forEach(el => {
    if (!el.hasAttribute('data-observed')) {
      el.setAttribute('data-observed', 'true');
      observer.observe(el);
    }
  });

  return observer;
}

/* =============================================
   ANIMATED COUNTER
   ============================================= */
function animateCounter(el, target, duration = 1800, suffix = '') {
  const isFloat = String(target).includes('.');
  const decimals = isFloat ? 1 : 0;
  const start = performance.now();
  el.classList.add('counting');

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (eased * target).toFixed(decimals) + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toFixed(decimals) + suffix;
      el.classList.remove('counting');
    }
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const numbers = document.querySelectorAll('.rating-number');
  const targets = [
    { value: 4.9, suffix: '' },
    { value: 500, suffix: '+' },
    { value: 97, suffix: '%' },
  ];
  const ratingsBar = document.querySelector('.ratings-bar');
  if (!ratingsBar) return;

  let fired = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        numbers.forEach((el, i) => {
          if (targets[i]) animateCounter(el, targets[i].value, 1800, targets[i].suffix);
        });
        observer.unobserve(ratingsBar);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(ratingsBar);
}

/* =============================================
   HERO PARTICLES
   ============================================= */
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const span = document.createElement('span');
    const size = Math.random() * 5 + 3;
    span.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%; top:${Math.random() * 100}%;
      animation-delay:${Math.random() * 5}s;
      animation-duration:${4 + Math.random() * 4}s;
      opacity:${0.2 + Math.random() * 0.5};
    `;
    container.appendChild(span);
  }
}

/* =============================================
   HEADER SCROLL EFFECT
   ============================================= */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* =============================================
   SHIMMER ON MAIN CTA
   ============================================= */
function initShimmerCTA() {
  const btn = document.querySelector('.course-cta .btn-gold');
  if (!btn) return;
  setTimeout(() => btn.classList.add('shimmer-active'), 1200);
}

/* =============================================
   ACTIVE NAV HIGHLIGHT
   ============================================= */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if (!navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${entry.target.id}`
            ? 'var(--color-text)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

/* =============================================
   RESPONSIVE: mobile collapses deck into column
   ============================================= */
function handleMobileDeck() {
  const deck = document.getElementById('barbersDeck');
  if (!deck) return;
  const mq = window.matchMedia('(max-width: 720px)');

  function apply(e) {
    if (e.matches) {
      deck.style.cssText = 'height:auto; flex-direction:column; align-items:center; gap:1.5rem;';
      deck.querySelectorAll('.card-slot').forEach(s => {
        s.style.transform = 'none';
        s.style.width = '300px';
        s.style.height = '460px';
      });
    } else {
      deck.style.cssText = '';
      deck.querySelectorAll('.card-slot').forEach(s => {
        s.style.cssText = '';
      });
    }
  }

  mq.addEventListener('change', apply);
  apply(mq);
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderBarbers();
  const scrollObserver = initScrollReveal();
  initCounters();
  initParticles();
  initHeaderScroll();
  initShimmerCTA();
  initActiveNav();
  handleMobileDeck();
  
  // Force immediate reveal for elements already in viewport on load
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, 100);
  
  console.log('🔥 Street Barbershop — 4 cartas carregadas');
});
