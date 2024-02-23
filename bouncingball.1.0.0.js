/**
 * usage: <script src="bouncingball.1.0.0.js" defer></script>
 * @description Generate and animate Bouncing Ball image
 * @author h1data
 * @version 1.0.0
 * @since 2024
 */
window.addEventListener('load', () => {
  /** interval time for initial velocity (sec) */
  const T = 1200;
  /** reflection coefficient */
  const E = -0.79;
  /** saturation level (%) */
  const S = 55;
  /** state enum of bouncing */
  var STATE = {
    MIDDLE: 0,
    BOTTOM: 1,
    STOPPED: 2
  };

  let displayArea = ((document.currentScript == undefined) ?
    document.querySelector('script[src="bouncingball.1.0.0.js"]')
    : document.currentScript).parentElement;


  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;

  const imgBall = drawBall(canvas);
  const imgShadow = drawShadow(canvas);

  /** ball radius (0.75rem) */
  this.r = Math.round(0.75 * parseFloat(getComputedStyle(document.body).fontSize));
  /** bottom offset */
  this.bottom = -2 * r;

  imgBall.style.top = `${bottom}px`;

  imgBall.width = r * 2;
  imgBall.height = r * 2;
  displayArea.append(imgBall);

  const shadowThreshold = -24 * r;
  imgShadow.style.top = `${-Math.round(r / 4 * 5)}px`;
  imgShadow.style.left = `${Math.round(3.5 * r)}px`;
  imgShadow.width = 4 * r;
  imgShadow.height = 2 * r;
  displayArea.append(imgShadow);

  /** y position */
  var y = 0;
  /** velocity */
  var v = -2 * getAreaHeight() / T;
  /** gravity */
  const G = - v / T;
  /** state of bounce */
  var state = STATE.MIDDLE;

  var preTime = undefined;
  var requestId = window.requestAnimationFrame(animate);

  function animate(time) {
    imgBall.style.top = `${y + bottom}px`;

    if (y > shadowThreshold) {
      let offset = y / shadowThreshold;
      imgShadow.style.scale = 0.5 * (1 - 0.6 * offset);
      imgShadow.style.opacity = 1.0 - offset;
      imgShadow.removeAttribute('hidden');
    } else {
      imgShadow.hidden = true;
    }

    let t = ( (preTime == undefined) ? 0 : (time - preTime) );
    preTime = time;
    v += G * t;
    y += v * t;
    if (y >= 0) {
      // reached the bottom
      if (Math.ceil(window.innerHeight + window.scrollY) - document.body.offsetHeight < -3) {
        // middle of scroll 
        state = STATE.MIDDLE;
        let scroll = Math.round(window.scrollY);
        v = calcVelocity(getAreaHeight() - scroll - window.innerHeight * (scroll / document.body.offsetHeight));  // TODO
      } else if (state == STATE.MIDDLE) {
        // bottom of scroll (1st time)
        state = STATE.BOTTOM;
        v = Math.max(v*E, calcVelocity(window.innerHeight - 4*r));
      } else if (state == STATE.BOTTOM) {
        // bottom of scroll (2nd time and later)
        v *= E;
        if ( (v * v / G) < 1.0) {
          // stop when estimate height is less than sub pixel
          state = STATE.STOPPED;
          v = 0;
          window.addEventListener('scroll', restart);
          return;
        }
      } else {
        return;
      }
      y = 0;
    }
    requestId = window.requestAnimationFrame(animate);
  }
  function drawBall(canvas) {
    let ctx = canvas.getContext('2d');
    ctx.reset();
    let hue = Math.random();
    let r = canvas.width / 2;
    let c = canvas.width / 3;
    ctx.ellipse(r, r, r, r, 0, 0, 2*Math.PI);
    let ballGrad = ctx.createRadialGradient(c, c, 0, c, c, 2*c);
    ballGrad.addColorStop(0, `hsl(${hue}turn ${S}% 90%)`);
    ballGrad.addColorStop(0.6, `hsl(${hue}turn ${S}% 45%)`);
    ballGrad.addColorStop(1, `hsl(${hue}turn ${S}% 20%)`);
    ctx.fillStyle = ballGrad;
    ctx.fill();
    
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.style.float = 'right';
    img.style.position = 'relative';
    img.style.zIndex = -1;
    return img;
  }
  function drawShadow(canvas) {
    let ctx = canvas.getContext('2d');
    ctx.reset();
    let r = canvas.width / 2;
    ctx.ellipse(r, r, r, r, 0, 0, 2*Math.PI);
    let shadowGrad = ctx.createRadialGradient(r, r, 0, r, r, r);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0');
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.style.opacity = 1.0;
    img.style.scale = 0.5;
    img.style.float = 'right';
    img.style.position = 'relative';
    img.style.zIndex = -2;
    return img;
  }
  function getAreaHeight() {
    return displayArea.clientHeight - 4 * r;
  }
  function calcVelocity(height) {
    return - Math.sqrt(2 * height * G);
  }
  function restart() {
    state = STATE.MIDDLE;
    preTime = undefined;
    window.removeEventListener('scroll', restart);
    requestId = window.requestAnimationFrame(animate);
  }
});
