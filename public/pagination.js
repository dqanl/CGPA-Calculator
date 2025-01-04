export const pagination = function (messages) {
  if (messages && Array.isArray(messages) && messages.length > 0) {
    const messagesContainer = document.querySelector('.messages-container');

    // Clear only the messages, not the SVG navigation
    messagesContainer.innerHTML = '';

    const messageTemplate = `
      <div class="form-floating form-control mb-3 message-Template">
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
              d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5.5 0 0 1 6.5 0h3A1.5.5 0 0 1 11 1.5zM6 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5z"
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
      messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
      //   paginationSection.insertAdjacentHTML('beforebegin', messageHTML);
    });
    // Scroll to the top of the messages container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

export const renderpage = async function (page, pageLimit) {
  try {
    const response = await axios.get(
      `/api/v1/user/messages?page=${page}&limit=${pageLimit}`,
      {
        withCredentials: true, // Ensure the cookie is sent
      }
    );
    //NEW-NEW-NEW
    const { messages, messageCount, uniqueString } = response.data;
    pagination(messages);
    //OLD-OLD-OLD
    // Ensure the element is available before trying to modify it
    const messageLinkInput = document.getElementById('message-Link-Input');
    const renewLinkButton = document.getElementById('renew-link-button');

    if (messageLinkInput && response && renewLinkButton) {
      const link = `http://127.0.0.1:8000/api/v1/message/${response.data.uniqueString}`;

      // Set the value of the input field
      messageLinkInput.value = link;


      //   console.log(response);
      //Renew Message-Link
      //   renewLinkButton.addEventListener('click', async () => {
      //     const newStr = await axios.patch('/api/v1/user/regenerate-id');
      //     if (newStr.data.newUniqueString) {
      //       messageLinkInput.value = `http://127.0.0.1:8000/api/v1/message/${newStr.data.newUniqueString}`;
      //       console.log(messageLinkInput.value);
      //     }
      //   });
    }
    return { uniqueString, messageCount };
  } catch (error) {
    console.error(
      'Failed to load user details:',
      error.response || error.message
    );
    showToast('Failed to load user details. Please log in again.', 'red');
    window.location.href = '/index.html'; // Redirect to login if token is invalid
  }
};

// Enable/Disable Previous and Next buttons based on the page number
export const updatePaginationButtons = function (page, pageNumbers) {
  const previousPage = document.querySelector('.bi-backspace-fill');
  const nextPage = document.querySelector('.bi-backspace-reverse-fill');
  if (page <= 1) {
    previousPage.classList.add('pointer-events-none', 'opacity-50');
  } else {
    previousPage.classList.remove('pointer-events-none', 'opacity-50');
  }

  if (page >= pageNumbers) {
    nextPage.classList.add('pointer-events-none', 'opacity-50');
  } else {
    nextPage.classList.remove('pointer-events-none', 'opacity-50');
  }
};

// export const renewLink = function (response) {
//   //OLD-OLD-OLD
//   // Ensure the element is available before trying to modify it
//   const messageLinkInput = document.getElementById('message-Link-Input');
//   const renewLinkButton = document.getElementById('renew-link-button');

//   if (messageLinkInput && response && renewLinkButton) {
//     const link = `http://127.0.0.1:8000/api/v1/message/${response}`;

//     messageLinkInput.value = link;

//     //Renew Message-Link
//     renewLinkButton.addEventListener('click', async () => {
//       const newStr = await axios.patch('/api/v1/user/regenerate-id');
//       if (newStr.data.newUniqueString) {
//         messageLinkInput.value = `http://127.0.0.1:8000/api/v1/message/${newStr.data.newUniqueString}`;
//         console.log(messageLinkInput.value);
//       }
//     });
//   }
// };
