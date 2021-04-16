function requestJSON(url, callback) {
    console.log("Requesting data.. " + url);

    $.ajax({
        url: url,
        complete: function (xhr) {
            callback.call(null, xhr.responseJSON);
        }
    });
}

$(function () {
    $('#update').on("click", function (e) {
        const username = $("#repo-username").val();
        const user_activity_url = 'https://api.github.com/users/' + username + "/events"; // /events?per_page=n, with n as a number. Allows to get a specific amount of events
        const user_repos_url = 'https://api.github.com/users/' + username + "/repos";

        // Local Storage (session), if not empty display the content
        const my_activity = localStorage.getItem("my_activity");
        const my_repos = localStorage.getItem("my_repos");

        // Events, on change request new data
        const allow_forked_repos = $('#allow-forks').val() === 'true';
        const max_events_to_show = $('#activity-events-count').val();
        const my_username = localStorage.getItem("my_username") || '';

        if (my_activity === null || my_activity.trim() === '' || username.toString() !== my_username.toString()) {
            requestJSON(user_activity_url, function (json) {
                localStorage.setItem("my_activity", JSON.stringify(json));
                displayActivity(json, max_events_to_show);
            });
        }
        else {
            displayActivity(JSON.parse(my_activity), max_events_to_show);
        }


        if (my_repos === null || my_repos.trim() === '' || allow_forked_repos.toString() !== localStorage.getItem("allow_forked_repos").toString() ||
            username.toString() !== my_username.toString()) {
            requestJSON(user_repos_url, function (json) {
                localStorage.setItem("allow_forked_repos", allow_forked_repos.toString());
                localStorage.setItem("my_repos", JSON.stringify(json));
                displayRepos(json, allow_forked_repos);
            });
        }
        else {
            displayRepos(JSON.parse(my_repos), allow_forked_repos);
        }

        // Save last used username
        localStorage.setItem("my_username", username.toString());

    })
})

function displayActivity(json, max_events_to_show) {
    $('#my-activity').empty();
    for (let i = 0; i < Math.min(json.length, max_events_to_show); i += 1) {
        $('#my-activity').append(getActivityEntry(json[i]));
    }
}

function displayRepos(json, allow_forked_repos) {
    $('#my-repos').empty();
    for (let i = 0; i < json.length; i += 1) {
        if (allow_forked_repos === false && json[i].fork === true) {
            continue;
        }
        $('#my-repos').append(getRepoEntry(json[i]));
    }
}


function getActivityEntry(json) {
    return `
        <div class="d-flex text-muted pt-3">
            <section class='pb-3 mb-0 small lh-sm border-bottom'>
                <h3>${json.repo.name}</h3 >
                <p>Event: ${json.type.split("E")[0]}</p>   
                <p>${(json.type === 'PushEvent' ? "Message: " + json.payload.commits[0].message : '')}</p>
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
                <p>Description: ${json.description} </p >
                <div id='footer'>
                    <p>Created:  ${json.created_at.split("T")[0]} </p>
                    <p>Last update: ${json.updated_at.split("T")[0]} </p>
                </div>
            </section>
        </div>    
        `
}