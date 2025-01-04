//create a unique alphanumeric string make it 12 characters long and includes special characters

// Check if the API response contains messages
const { messages, messageCount } = response.data;

if (messages && Array.isArray(messages) && messages.length > 0) {
  const container = document.querySelector('.form-container');
  const messageTemplate = `
          <div class="form-floating form-control mb-3">
            <h6 class="text-start fw-bold user-msg-content">{CONTENT}</h6>
            <hr />
            <h6 class="fst-italic user-message-time">Sent: {TIMESTAMP}</h6>
            <div class="d-flex justify-content-center align-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="red"
                class="bi bi-trash3-fill delete-svg"
                viewBox="0 0 16 16"
                data-id="{MESSAGE_ID}"
              >
                <path
                  d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5zM6 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5z"
                />
              </svg>
            </div>
          </div>
        `;

  // Loop through messages and create HTML for each
  messages.forEach((message) => {
    const messageHTML = messageTemplate
      .replace('{CONTENT}', message.content)
      .replace('{TIMESTAMP}', new Date(message.timestamp).toLocaleString())
      .replace('{MESSAGE_ID}', message._id);

    // Append the generated message HTML to the container
    container.insertAdjacentHTML('beforeend', messageHTML);
  });
}
