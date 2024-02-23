class Job {
    constructor(title, department, id = null) {
        this.id = id;
        this.title = title;
        this.departments = [];
        if (department) {
            this.addDepartment(department.name, department.openPositions);
        }
    }

    addDepartment(name, openPositions) {
      
        this.departments.push({ name, openPositions });
    }



updateDepartment(oldName, newName, newOpenPositions) {
    let deptIndex = this.departments.findIndex(dept => dept.name === oldName);
    if (deptIndex !== -1) {
        this.departments[deptIndex] = { name: newName, openPositions: newOpenPositions };
    } else {
        console.error("Department not found");
    }
}

deleteDepartment(deptName) {
    let deptIndex = this.departments.findIndex(dept => dept.name === deptName);
    if (deptIndex !== -1) {
        this.departments.splice(deptIndex, 1);
    } else {
        console.error("Department not found");
    }
}
}




class JobService {
    static url = 'https://65d7ef2c27d9a3bc1d7be972.mockapi.io/PromineoTechAPI/jobs';

    static getAllJobs() {
        return $.get(this.url);
    }

    static getJob(id) {
        return $.get(`${this.url}/${id}`);
    }

    static createJob(job) {
        return $.post(this.url, job);
    }

    static updateJob(job) {
        if (!job || !job.id) {
            console.error("Job ID is required for update.");
            return  Promise.reject("Job ID is required for update");
        }
        return $.ajax({
            url: `${this.url}/${job.id}`,
            dataType: 'json',
            data: JSON.stringify(job),
            contentType: 'application/json',
            method: 'PUT'
        });
    }

    static deleteJob(jobId) {
        return $.ajax({
            url: `${this.url}/${jobId}`,
            method: 'DELETE'
        });
    }
}


class DOMManager {
    static jobs = [];



    static getAllJobs() {
        JobService.getAllJobs().then(response => {
            this.jobs = response.map(job => new Job(job.title, {name: "Default", openPositions: 0}, job.id));
            this.render();
        }).catch(error => {
            console.error('Error fetching jobs:', error);
            this.jobs = [];
        });
    }
     

        
    
        
     

    static createJob(title) {
        let job = new Job(title);
        JobService.createJob(job).then(response => {
            let createdJobWithId = response;
            this.jobs.push(new Job(createdJobWithId.title, null, createdJobWithId.id)); // Re-create the job with the id
            this.getAllJobs(); // Refresh the job list
        });
    
    }


    static deleteJob(jobId) {
        JobService.deleteJob(jobId).then(() => this.getAllJobs());

    }


    static editJobForm(jobId) {
        let job = this.jobs.find(job => job.id === jobId);
        if (!job) return;

        let newTitle = prompt("Edit Job Title", job.title);
        if (newTitle) {
            job.title = newTitle;
            JobService.updateJob(job).then(() => {
             this.getAllJobs();
        }).catch(error => {
        
        console.error(error);
        });
    }
}

    static render() {

            if (!Array.isArray(this.jobs)) {
                console.error('this.jobs is not an array', this.jobs);
                return; // Exit the method if this.jobs is not an array
            }
    
            const app = $('#app');
            app.empty(); // Clear existing job listings
    
            this.jobs.forEach(job => {
                let jobDiv = $('<div>').addClass('job').attr('id', `job-${job.id}`);
                jobDiv.append($('<h3>').text(job.title));
                jobDiv.append($('<button>').addClass('btn btn-danger').text('Delete').click(() => this.deleteJob(job.id)));
                jobDiv.append($('<button>').addClass('btn btn-secondary').text('Edit').click(() => this.editJobForm(job.id)));
        
                const departmentsList = $('<ul>');
                // Validate departments is an array before iterating
                if (Array.isArray(job.departments)) {
                    job.departments.forEach(dept => {
                        let deptItem = $('<li>').text(`${dept.name}: ${dept.openPositions} open positions`);
                        let editBtn = $('<button>').text('Edit').addClass('btn btn-secondary').click(() => DOMManager.editDepartment(job.id, dept.name));
                        let deleteBtn = $('<button>').text('Delete').addClass('btn btn-danger').click(() => DOMManager.deleteDepartment(job.id, dept.name));
                        deptItem.append(editBtn, deleteBtn); // Make sure to append these buttons to your department item
                        departmentsList.append(deptItem);
                    });
                } else {
                    console.error('job.departments is not an array', job);
                }
                jobDiv.append(departmentsList);
        
                app.append(jobDiv);
            });
        }

    static editDepartment(jobId, deptName) {
        let job = this.jobs.find(job => job.id === jobId);
        if (!job) return;
    
        let newName = prompt("Enter new department name:", deptName);
        let newOpenPositions = prompt("Enter new open positions count:", job.departments.find(dept => dept.name === deptName).openPositions);
    
        if (newName && newOpenPositions) {
            job.updateDepartment(deptName, newName, newOpenPositions);
            this.render(); 
        }
    }
    
    static deleteDepartment(jobId, deptName) {
        let job = this.jobs.find(job => job.id === jobId);
        if (!job) return;
    
        let confirmDelete = confirm(`Are you sure you want to delete the department: ${deptName}?`);
        if (confirmDelete) {
            job.deleteDepartment(deptName);
            this.render(); // Re-render the UI after deletion
        }
    }
}
    

$(document).ready(function() {
    $('#create-new-job').click(function() {
        const title = $('#new-job-title').val().trim();
        if (title) {
            DOMManager.createJob(title);
            $('#new-job-title').val(''); // Reset input field
        }
    });

    DOMManager.getAllJobs(); // Load all jobs on page load
});

