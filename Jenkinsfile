pipeline {

    agent any


    parameters {

        choice(
            name: 'PLAYWRIGHT_TEST',
            choices: [
                'test:dev',
                'test:qa',
                'test:prod',
                'test:mweb',
                'test:file:prod',
                'test:all',
                'test:account',
                'test:playback',
                'test:launch',
                'test:search',
                'test:watchlist',
                'test:region',
                'test:registration',
                'test:high',
                'test:medium',
                'test:low'
            ],
            description: 'Select Playwright test suite'
        )

    }


    stages {


        stage('Checkout Repo B') {

            steps {

                echo "Repo B checkout handled by Pipeline from SCM"

            }

        }


        stage('Check Environment') {

            steps {

                echo "Checking Windows environment"

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


        stage('Run Selected Playwright Test') {

            steps {

                echo "Selected Test: ${params.PLAYWRIGHT_TEST}"

                bat "npm run ${params.PLAYWRIGHT_TEST}"

            }

        }


    }


    post {


        always {

            echo "Publishing Playwright HTML Report"

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

            echo "Playwright execution completed successfully"

        }


        failure {

            echo "Playwright execution failed"

        }

    }

}
