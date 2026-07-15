function normalizeCat(raw){
  const c = String(raw||'').toLowerCase().trim();
  if(['keychains','dolls','flowers','accessories'].includes(c)) return c;
  const reverseMap = {'سلاسل مفاتيح':'keychains','دمى':'dolls','ورود':'flowers','إكسسوارات':'accessories'};
  return reverseMap[String(raw||'').trim()] || c;
}
