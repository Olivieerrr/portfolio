/**
 * PORTFOLIO VIDÉO - INTERACTIONS & LECTEUR MODAL
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. GESTION DU HEADER AU SCROLL
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. MENU MOBILE RESPONSIVE
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    // Fermer le menu mobile lors d'un clic sur un lien
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // 3. LECTEUR VIDÉO MODAL (LIGHTBOX)
  const videoModal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalIframe = document.getElementById('modalIframe');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalCategory = document.getElementById('modalCategory');
  const modalClose = document.getElementById('modalClose');
  const modalLocalAlert = document.getElementById('modalLocalAlert');
  const modalExternalLink = document.getElementById('modalExternalLink');

  // Fonction pour ouvrir la modale avec une vidéo (locale ou YouTube)
  function openVideoModal(src, title, desc, category) {
    if (!videoModal) return;
    
    const isYouTube = src && (
      src.includes('youtube.com') || 
      src.includes('youtube-nocookie.com') || 
      src.includes('youtu.be')
    );
    const isFileProtocol = window.location.protocol === 'file:';

    if (modalTitle) modalTitle.textContent = title || 'Aperçu du projet';
    if (modalDesc) modalDesc.textContent = desc || '';
    if (modalCategory) modalCategory.textContent = category || 'Vidéo';

    if (isYouTube) {
      // Masquer la balise vidéo HTML5
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.style.display = 'none';
      }

      // Alerte spéciale si ouvert directement en fichier local file:///
      if (modalLocalAlert) {
        modalLocalAlert.style.display = isFileProtocol ? 'flex' : 'none';
      }

      // Bouton vers YouTube direct
      if (modalExternalLink) {
        const idMatch = src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
        const ytWatchUrl = idMatch ? `https://www.youtube.com/watch?v=${idMatch[1]}` : src;
        modalExternalLink.href = ytWatchUrl;
        modalExternalLink.style.display = 'inline-flex';
      }

      if (modalIframe) {
        let embedUrl = src;
        if (!embedUrl.includes('autoplay=1')) {
          embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        // Ajouter le paramètre d'origine si servi via HTTP/HTTPS
        if (window.location.protocol.startsWith('http') && window.location.origin && window.location.origin !== 'null') {
          embedUrl += '&origin=' + encodeURIComponent(window.location.origin);
        }
        modalIframe.src = embedUrl;
        modalIframe.style.display = 'block';
      }
    } else {
      if (modalLocalAlert) modalLocalAlert.style.display = 'none';
      if (modalExternalLink) modalExternalLink.style.display = 'none';

      if (modalIframe) {
        modalIframe.removeAttribute('src');
        modalIframe.style.display = 'none';
      }
      if (modalVideo) {
        modalVideo.src = src;
        modalVideo.style.display = 'block';
        modalVideo.play().catch(err => {
          console.log('Lecture automatique bloquée par le navigateur :', err);
        });
      }
    }

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Empêcher le défilement de l'arrière-plan
  }

  // Fonction pour fermer la modale
  function closeVideoModal() {
    if (!videoModal) return;
    
    videoModal.classList.remove('active');
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute('src'); // Arrêter le flux pour économiser la mémoire
      modalVideo.load();
      modalVideo.style.display = 'none';
    }
    if (modalIframe) {
      modalIframe.removeAttribute('src'); // Couper immédiatement la lecture YouTube
      modalIframe.style.display = 'none';
    }
    if (modalLocalAlert) {
      modalLocalAlert.style.display = 'none';
    }
    if (modalExternalLink) {
      modalExternalLink.style.display = 'none';
    }
    document.body.style.overflow = ''; // Rétablir le défilement
  }

  // Écouteurs pour fermer la modale
  if (modalClose) {
    modalClose.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
      closeVideoModal();
    }
  });

  // Déclencheurs d'ouverture depuis les cartes de projets
  const playableElements = document.querySelectorAll('[data-video-src]');
  playableElements.forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const src = elem.getAttribute('data-video-src');
      const title = elem.getAttribute('data-title');
      const desc = elem.getAttribute('data-desc');
      const category = elem.getAttribute('data-category');
      openVideoModal(src, title, desc, category);
    });
  });

  // 4. SYSTÈME DE FILTRAGE DES PROJETS
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Met à jour la classe active du bouton
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // 5. GESTION DU CHARGEMENT OPTIMISÉ (Zéro saturation RAM/CPU)
  // Les vidéos ne sont plus préchargées simultanément en arrière-plan, garantissant une navigation 100% fluide.

  // 6. FORMULAIRE DE CONTACT AVEC ENVOI DIRECT (100% SUR LE SITE)
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const name = (document.getElementById('name')?.value || '').trim();
      const email = (document.getElementById('email')?.value || '').trim();
      const type = (document.getElementById('type')?.value || '').trim();
      const message = (document.getElementById('message')?.value || '').trim();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
      }

      // Si le site est ouvert directement en fichier local (file://)
      if (window.location.protocol === 'file:') {
        if (formSuccess) {
          formSuccess.style.display = 'block';
          formSuccess.style.color = '#c2410c';
          formSuccess.style.backgroundColor = '#fff7ed';
          formSuccess.style.borderColor = '#fed7aa';
          formSuccess.innerHTML = '⚠️ <strong>Mode fichier local détecté :</strong><br>Pour tester l\'envoi direct sans ouvrir de logiciel externe, lancez le fichier <code>lancer-site.bat</code> (qui démarre le serveur local sur <em>http://localhost:8000</em>) ou publiez le site sur le web. Les navigateurs et serveurs anti-spam bloquent l\'envoi direct depuis une adresse <code>file:///</code>.';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Envoyer le message';
        }
        return;
      }

      try {
        const response = await fetch('https://formsubmit.co/ajax/olivier.leriche13@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `Nouveau message Portfolio - ${name || 'Visiteur'}${type ? ' (' + type + ')' : ''}`,
            Nom: name,
            Email: email,
            Projet: type || 'Non spécifié',
            Message: message
          })
        });

        const data = await response.json();

        if (data.success === 'true' || data.success === true) {
          if (formSuccess) {
            formSuccess.style.display = 'block';
            formSuccess.style.color = '#15803d';
            formSuccess.style.backgroundColor = '#f0fdf4';
            formSuccess.style.borderColor = '#bbf7d0';
            formSuccess.textContent = 'Merci pour votre message ! Il a bien été envoyé directement à Olivier LE RICHE.';
          }
          contactForm.reset();
        } else if (data.message && data.message.includes('Activation')) {
          if (formSuccess) {
            formSuccess.style.display = 'block';
            formSuccess.style.color = '#c2410c';
            formSuccess.style.backgroundColor = '#fff7ed';
            formSuccess.style.borderColor = '#fed7aa';
            formSuccess.innerHTML = '📬 <strong>Activation requise (une seule fois) :</strong><br>FormSubmit vous a envoyé un email de confirmation sur <strong>olivier.leriche13@gmail.com</strong> (pensez à vérifier vos spams ou l\'onglet Promotions). Cliquez sur le lien <em>"Activate Form"</em> pour autoriser la réception, puis réessayez.';
          }
        } else {
          throw new Error(data.message || 'Erreur lors de l\'envoi');
        }
      } catch (err) {
        console.error('Erreur FormSubmit :', err);
        if (formSuccess) {
          formSuccess.style.display = 'block';
          formSuccess.style.color = '#b91c1c';
          formSuccess.style.backgroundColor = '#fef2f2';
          formSuccess.style.borderColor = '#fecaca';
          formSuccess.textContent = 'Une erreur est survenue lors de l\'envoi. Veuillez vérifier votre connexion ou écrire directement à olivier.leriche13@gmail.com.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Envoyer le message';
        }
      }
    });
  }

  // 7. BOUTON RETOUR EN HAUT
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
