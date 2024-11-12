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
                    // Define the SonarScanner tool location configured in Jenkins
                    def scannerHome = tool 'SonarScanner'
                    
                    // Run SonarQube analysis
                    withSonarQubeEnv('sq1') { // Ensure this matches the SonarQube server name in Jenkins
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
        stage('Quality Gate') {
            steps {
                // Wait for the analysis report to process and check the Quality Gate status
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
