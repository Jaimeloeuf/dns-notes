chrome.storage.sync.get("webAppURL", ({ webAppURL }) => {
  // Div to group everything together to return as a single element
  const div = document.createElement("div");
  div.innerHTML = `<h1>DNS Notes</h1>`;

  div.innerHTML += `<a target="_blank" href="${webAppURL}/notes/all">View all notes</a>`;
  div.innerHTML += `<a target="_blank" href="${webAppURL}/notes/new">Create new note</a>`;
  div.innerHTML += `<a target="_blank" href="${webAppURL}/settings">Account Settings</a>`;

  document.body.appendChild(div);
});
