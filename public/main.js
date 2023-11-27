var thumbUp = document.getElementsByClassName("fa-thumbs-up");
var trash = document.getElementsByClassName("fa-trash");

Array.from(thumbUp).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
        fetch('messages', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'name': name,
            'msg': msg,
            'thumbUp':thumbUp
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});



Array.from(trash).forEach(function (element) {
    element.addEventListener("click", function () {
        const expenseId = this.getAttribute("data-expense-id");

        // Send a request to delete the expense
        fetch("/deleteExpense", {
            method: "delete",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                expenseId: expenseId
            })
        })
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Failed to delete expense");
            }
        })
        .then(function (data) {
            console.log(data);
            window.location.reload(true);
        })
        .catch(function (error) {
            console.error(error);
        });
    });
});

