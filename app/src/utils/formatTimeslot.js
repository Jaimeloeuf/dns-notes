/*
For whatever reason, browsers have yet to support the shorter form of passing options to locale formatter directly
console.log(new Date().toLocaleDateString("default", { dateStyle: "full", timeStyle: "short" }));

Only longer form works by passing to DateTimeFormat method.
console.log(new Intl.DateTimeFormat('default', { dateStyle: 'full', timeStyle: 'short' }).format(new Date()));
*/
export default (timeslot) =>
  new Intl.DateTimeFormat("default", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(timeslot));
