// Cyberpunk card parallax + gentle tilt
(function () {
  const cards = document.querySelectorAll('#services .grid .card');

  cards.forEach(card => {
    const rect = () => card.getBoundingClientRect();

    function onMove(e) {
      const r = rect();
      const x = (e.clientX - r.left) / r.width;   // 0..1
      const y = (e.clientY - r.top)  / r.height;  // 0..1
      const px = (x - 0.5) * 2;                   // -1..1
      const py = (y - 0.5) * 2;

      // feed CSS vars for parallax (icon/title) and tilt (card)
      card.style.setProperty('--px', px.toFixed(3));
      card.style.setProperty('--py', py.toFixed(3));

      const tiltX = py * 4;   // rotateX toward cursor
      const tiltY = -px * 3;  // rotateY toward cursor
      card.style.transform =
        `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    }

    function onLeave() {
      card.style.removeProperty('--px');
      card.style.removeProperty('--py');
      card.style.transform = ''; // let CSS hover state handle resets
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });
})();
