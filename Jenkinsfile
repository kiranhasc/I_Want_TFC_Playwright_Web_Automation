pipeline {

    agent any


    stages {


        stage('Checkout Repo B') {

            steps {

                echo "Repo B checkout is handled automatically by Pipeline from SCM"

            }

        }


        stage('Check Environment') {

            steps {

                echo "Checking Node and Playwright versions"

                bat 'node -v'

                bat 'npm -v'

                bat 'npx playwright --version'

            }

        }


        stage('Install Dependencies') {

            steps {

                echo "Installing npm dependencies"

                bat 'npm install'

            }

        }


        stage('Install Playwright Browsers') {

            steps {

                echo "Installing Playwright browsers"

                bat 'npx playwright install'

            }

        }


        stage('Run Playwright Tests') {

            steps {

                echo "Executing Playwright tests"

                bat 'npx playwright test'

            }

        }


    }


    post {


        always {

            echo "Generating Playwright report"


            publishHTML([

                allowMissing: true,

                alwaysLinkToLastBuild: true,

                keepAll: true,

                reportDir: 'playwright-report',

                reportFiles: 'index.html',

                reportName: 'Playwright HTML Report'

            ])

        }


        success {

            echo "Playwright tests completed successfully"

        }


        failure {

            echo "Playwright tests failed"

        }


    }

}
