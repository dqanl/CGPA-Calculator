import {
  pagination,
  renderpage,
  updatePaginationButtons,
} from './pagination.js';
document.addEventListener('DOMContentLoaded', async () => {
  function showToast(message, color) {
    const toastElement = document.getElementById('myToast');
    if (toastElement) {
      toastElement.querySelector('.toast-body').textContent = message;
      if (color === 'red') {
        document.querySelector('.toast').classList.remove('bg-success');
        document.querySelector('.toast').classList.add('bg-danger');
      }
      if (color === 'green') {
        document.querySelector('.toast').classList.remove('bg-danger');
        document.querySelector('.toast').classList.add('bg-success');
      }

      const toast = new bootstrap.Toast(toastElement);
      toast.show();

      setTimeout(() => {
        toast.hide();
      }, 5000); // 5000 ms = 5 seconds
    } else {
      console.error('Toast element not found');
    }
  }
  // Ensure this logic only runs on message.html
  const currentPage = window.location.pathname.split('/').pop();
 
  if (/^[a-f0-9\-]{36}$/.test('9291f22f-76db-4f83-a9df-7524c2e46310')) {
    // Grab the ID from the URL on page load
    const urlPath = window.location.pathname;
    const idMatch = urlPath.match(/\/message\/([a-f0-9-]{36})/); // Match a UUID (36 characters with dashes)

    if (idMatch && idMatch[1]) {
      const messageId = idMatch[1];

      // Input the ID into the textarea dynamically
      const uniqueStringTextarea = document.querySelector(
        '.unique-string-text'
      );
      if (uniqueStringTextarea) {
        uniqueStringTextarea.value = messageId;
      }
    }
  }
  // Handle REGISTRATION Form
  const registerForm = document.getElementById('register-form');
  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.querySelector('.username-register').value;
    const password = document.querySelector('.password-register').value;
    const email = document.querySelector('.email-register').value;
    const expirationHours = document.querySelector(
      '.expiration-hours-register'
    ).value;

    try {
      const response = await axios.post('/api/v1/auth/register', {
        username,
        password,
        email,
        expirationHours,
      });
      showToast('Registration successful! Welcome aboard!', 'green');
      window.location.href = '/index.html';
    } catch (error) {
      console.log(error.response.data.message);
      showToast(error.response.data.message, 'red');
    }
  });
  // Handle LOGIN Form
  const loginForm = document.getElementById('login-form');
  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailOrUsername = document.querySelector(
      '.usernameOrEmail-login'
    ).value;
    const password = document.querySelector('.password-login').value;

    try {
      const response = await axios.post('/api/v1/auth/login', {
        emailOrUsername,
        password,
      });

      showToast('Login successful!', 'green');
      console.log(response);

      // Redirect to main page
      window.location.href = '/user-page.html';
    } catch (error) {
      console.log(error.response);
      showToast(error.response?.data?.message || 'Login failed', 'red');
    }
  });

  // Handle Message Form Submission
  const messageForm = document.getElementById('message-form');
  messageForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = document.querySelector('.recepient-message').value;
    const uniqueString = document.querySelector('.unique-string-text').value;

    if (message.length < 11 || message.length > 250) {
      return showToast(
        'Messages must be between 11 and 250 characters.',
        'red'
      );
    }

    try {
      const response = await axios.post(`/api/v1/message/${uniqueString}`, {
        message,
      });
      showToast(response.data.message, 'green');
      document.querySelector('.recepient-message').value = '';
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response && error.response.data && error.response.data.error) {
        showToast(error.response.data.error, 'red');
      } else {
        showToast(
          'An unexpected error occurred. Please try again later.',
          'red'
        );
      }
      document.querySelector('.recepient-message').value = ''; // Clear the textarea on error
    }
  });

  const copyFunction = function (input, goodToast, badToast) {
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard
      .writeText(input.value)
      .then(() => {
        showToast(goodToast, 'green');
      })
      .catch((err) => {
        showToast(badToast, 'red');
      });
  };

  // Donation Section
  const copyButton = document.getElementById('copyButton');
  const copyLinkButton = document.getElementById('copy-link-button');
  const walletAddressInput = document.getElementById('walletAddress');
  const messageLinkInput = document.getElementById('message-Link-Input');

  copyButton?.addEventListener('click', function () {
    copyFunction(
      walletAddressInput,
      'BTC wallet address copied to clipboard! Ensure you use the correct network to avoid loss of funds.',
      'Failed to copy wallet address.'
    );
  });

  copyLinkButton?.addEventListener('click', function () {
    copyFunction(
      messageLinkInput,
      'Message link copied! Now you can share it with your friends.',
      'Failed to copy message link'
    );
  });

  /// NEW
  let limit = 10;
  let page = 1;

  if (window.location.pathname === '/user-page.html') {
    try {
      const previousPage = document.querySelector('.bi-backspace-fill');
      const nextPage = document.querySelector('.bi-backspace-reverse-fill');

      // Initial page render
      let { messageCount, uniqueString } = await renderpage(page, limit);
      console.log(uniqueString);
      let pageNumbers = Math.ceil(messageCount / limit);

      // Update buttons on initial load
      updatePaginationButtons(page, pageNumbers);

      // Previous Page Button
      previousPage.addEventListener('click', async () => {
        if (page > 1) {
          page--;
          await renderpage(page, limit);
          updatePaginationButtons(page, pageNumbers);
        }
      });

      // Next Page Button
      nextPage.addEventListener('click', async () => {
        if (page < pageNumbers) {
          page++;
          await renderpage(page, limit);
          updatePaginationButtons(page, pageNumbers);
        }
      });

      //Refresh Page
      document
        .querySelector('.refresh-messages')
        .addEventListener('click', async (event) => {
          event.preventDefault();
          const updatedMessageCount = await renderpage(page, limit);
          console.log(updatedMessageCount.messageCount);
          page = 1;
          limit = 10;
          pageNumbers = Math.ceil(updatedMessageCount.messageCount / limit);

          await renderpage(page, limit);
          updatePaginationButtons(1, pageNumbers);
        });
    } catch (error) {
      console.error('An error occurred while rendering the page:', error);
    }
  }

  const messageContainer = document.querySelector('.messages-container');
  // Event listener for deleting messages

  messageContainer?.addEventListener('click', async (event) => {
    // Ensure the target clicked is a delete SVG
    const deleteSvg = event.target.closest('.delete-svg');

    if (deleteSvg) {
      const messageId = deleteSvg.getAttribute('data-id'); // Get the message ID
      const messageElement = deleteSvg.closest('.form-floating'); // Get the parent message element

      // Optimistically remove the message from the UI immediately
      messageElement.remove();

      try {
        // Make the API request to delete the message
        await axios.delete(`/api/v1/user/messages/${messageId}`);
        console.log(`Message with ID ${messageId} deleted successfully`);
        showToast('Message deleted sucessfully', 'green');
        // Optionally remove the loading indicator here
        // loadingIndicator.remove();
      } catch (error) {
        console.error('Error deleting message:', error);
        showToast('Error deleting message', 'red');

        // // If deletion failed, restore the message to the UI
        // messageElement.style.display = 'block'; // Show the message again
        // loadingIndicator.remove(); // Remove the loading indicator

        showToast('Failed to delete the message. Please try again.', 'red');
      }
    }
  });

  const renewLinkButton = document.getElementById('renew-link-button');
  renewLinkButton?.addEventListener('click', async () => {
    const messageLinkInput = document.getElementById('message-Link-Input');
    const newStr = await axios.patch('/api/v1/user/regenerate-id');
    if (newStr.data.newUniqueString) {
      // console.log(mess);
      messageLinkInput.value = `http://127.0.0.1:8000/api/v1/message/${newStr.data.newUniqueString}`;
      console.log(messageLinkInput.value);
    }
  });

  //LOGOUT
  const btnLogOut = document.querySelector('.btn-log-out');
  btnLogOut?.addEventListener('click', async (event) => {
    event.preventDefault();

    try {
      // Send logout request to the server using Axios
      await axios.post(
        '/api/v1/auth/logout', // Endpoint for logout
        {
          withCredentials: true, // Ensures cookies are sent with the request
        }
      );
      showToast('Logged Out', 'green');
      window.location.href = '/index.html'; // Replace with the path to your login page
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Logout failed. Please try again.',
        'red'
      );
    }
  });
});
