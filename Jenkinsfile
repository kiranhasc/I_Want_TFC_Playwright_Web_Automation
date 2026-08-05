pipeline {

    agent any

    environment {
        REPO_B_URL = 'https://github.com/<username>/<repo-b>.git'
        BRANCH = 'main'
    }


    stages {

        stage('Checkout Repo B') {

            steps {

                echo "Checking out Repo B"

                git(
                    url: "${REPO_B_URL}",
                    branch: "${BRANCH}",
                    credentialsId: 'github-creds'
                )

            }
        }

        stage('Test') {

            steps {

                echo "Running tests"

                // Add test commands here

            }

        }

    }


    post {

        success {

            echo "Pipeline completed successfully"

        }


        failure {

            echo "Pipeline failed"

        }

    }

}
