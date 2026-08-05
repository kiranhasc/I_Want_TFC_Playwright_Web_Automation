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
            description: 'Select Playwright test suite to execute'
        )

    }


    stages {


        stage('Install Dependencies') {

            steps {

                echo "Installing npm packages"

                bat 'npm install'

            }

        }


        stage('Install Playwright Browser') {

            steps {

                echo "Installing Playwright browsers"

                bat 'npx playwright install'

            }

        }


        stage('Run Playwright Test') {

            steps {

                echo "Running: npm run ${params.PLAYWRIGHT_TEST}"

                bat "npm run ${params.PLAYWRIGHT_TEST}"

            }

        }


    }


    post {


        always {

            echo "Publishing Playwright Report"

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

            echo "Tests completed successfully"

        }


        failure {

            echo "Tests failed"

        }

    }

}
