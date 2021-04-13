function requestJSON(url, callback) {
    $.ajax({
        url: url,
        complete: function (xhr) {
            callback.call(null, xhr.responseJSON);
        }
    });
}

$(function () {
    $('#update').on("click", function (e) {
        const username = "Stijn-Hendrix"
        const max_events_to_show = $('#activity-events-count').val();
        const user_activity_url = 'https://api.github.com/users/' + username + "/events";
        const user_repos_url = 'https://api.github.com/users/' + username + "/repos";
        const allow_forked_repos = $('#allow-forks').val() === 'true';


        requestJSON(user_activity_url, function (json) {
            $('#my-activity').empty();
            for (let i = 0; i < Math.min(json.length, max_events_to_show); i += 1) {
                $('#my-activity').append(getActivityEntry(json[i]));
            }
        });

        requestJSON(user_repos_url, function (json) {
            $('#my-repos').empty();
            for (let i = 0; i < json.length; i += 1) {
                if (allow_forked_repos === false && json[i].fork === true) {
                    continue;
                }
                $('#my-repos').append(getRepoEntry(json[i]));
            }
        });
    })
})


function getActivityEntry(json) {
    return `
        <div class="d-flex text-muted pt-3">
            <section class='pb-3 mb-0 small lh-sm border-bottom'>
                <h3>${json.repo.name}</h3 >
                <p>Event: ${json.type.split("E")[0]}</p>   
                <p>${(json.type === 'CreateEvent' ? '' : "Message: " + json.payload.commits[0].message)}</p>
                <div id='footer'>
                    <p>At: ${json.created_at.split("T")[0]}</p>
                </div>
            </section>
        </div>    
        `
}

function getRepoEntry(json) {
    return `
        <div class="d-flex text-muted pt-3">
            <section class='pb-3 mb-0 small lh-sm border-bottom'>
                <a href='${json.html_url}'><h3>${json.name}</h3></a>
                ${json.fork ? "<img class='fas fa-code-branch' width=16 height=16 src='./assets/img/forked.jpg'>" : ''}
                <p> ${json.description} </p >
                <div id='footer'>
                    <p>Created:  ${json.created_at.split("T")[0]} </p>
                    <p>Last update: ${json.updated_at.split("T")[0]} </p>
                </div>
            </section>
        </div>    
        `
}