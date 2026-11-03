
pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Build and Test') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'chmod +x mvnw'
                        sh './mvnw clean verify'
                    } else {
                        bat 'mvnw.cmd clean verify'
                    }
                }
            }
        }
    }

    post {
        always {
            junit testResults: 'target/surefire-reports/*.xml',
                  allowEmptyResults: true
        }

        success {
            archiveArtifacts artifacts: 'target/*.jar',
                             fingerprint: true
        }

        failure {
            echo 'Build failed. Check the console output.'
        }
    }
}
