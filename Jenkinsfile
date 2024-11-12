pipeline {
    agent any
    stages {
        stage('SCM') {
            steps {
                checkout scm
            }
        }
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'Sonarscanner(new)' // Match the name you configured in Jenkins
                    withSonarQubeEnv('sq1') { // Use 'sq1' for the SonarQube server name
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.login=Jen-sonar" // Pass in the authentication token
                    }
                }
            }
        }
        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
