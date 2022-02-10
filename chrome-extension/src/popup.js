chrome.storage.sync.get("appURL", ({ appURL }) => {
  // Div to group everything together to return as a single element
  const div = document.createElement("div");
  div.innerHTML = `<h1>DNS Notes</h1>`;

  div.innerHTML += `<a target="_blank" href="${appURL}/view">View all notes</a>`;
  div.innerHTML += `<a target="_blank" href="${appURL}/create">Create new note</a>`;
  div.innerHTML += `<a target="_blank" href="${appURL}/settings">Account Settings</a>`;

  document.body.appendChild(div);
});
