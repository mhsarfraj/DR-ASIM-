// CONFIGURE THESE
const CONFIG={
  API_URL:'https://script.google.com/macros/s/AKfycbyCBciRQLJv9EKXuWdHU2PTJKe1lrY8SkwwCxlTOKAHaIfxRAkdhjYEOgcplTPvohbEMg/exec', // while this is unchanged the site runs in DEMO mode with sample data
  PHONE:'',      // optional fallback; set the real one in Admin → Profile & Clinic
  WHATSAPP:'',
  MAPS_LINK:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('New Market, Near LIC Office, Main Road, Basti, Uttar Pradesh 272002')
};
const api={
  async get(a){const r=await fetch(CONFIG.API_URL+'?action='+a);return r.json();},
  async post(o){const r=await fetch(CONFIG.API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(o)});return r.json();}
};
