
pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        REMOTE_HOST = '172.19.124.100'
        REMOTE_USER = 'dellpruthvi'
        REMOTE_PROJECT_DIR = '/home/dellpruthvi/projects/ExpenseTracker'
        APP_JAR = 'expense_tracker-0.0.1-SNAPSHOT.jar'
    }

    stages {

        stage('Build and Test') {
            steps {
                sh '''
                    chmod +x mvnw
                    ./mvnw clean verify
                '''
            }
        }

        stage('Archive Artifact') {
            steps {
                archiveArtifacts artifacts: 'target/expense_tracker-0.0.1-SNAPSHOT.jar',
                                 fingerprint: true
            }
        }

        stage('Deploy JAR to Ubuntu') {
            steps {
                sshagent(credentials: ['ansible-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=accept-new \
                            $REMOTE_USER@$REMOTE_HOST \
                            "mkdir -p $REMOTE_PROJECT_DIR/target"

                        scp -o StrictHostKeyChecking=accept-new \
                            target/$APP_JAR \
                            $REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_DIR/target/$APP_JAR
                    '''
                }
            }
        }

        stage('Ansible Deployment') {
            steps {
                sshagent(credentials: ['ansible-ssh-key']) {
                    withCredentials([
                        string(
                            credentialsId: 'ansible-sudo-password',
                            variable: 'ANSIBLE_BECOME_PASSWORD'
                        )
                    ]) {
                        sh '''
                            set +x

                            printf '%s' "$ANSIBLE_BECOME_PASSWORD" |
                            ssh -o StrictHostKeyChecking=accept-new \
                                $REMOTE_USER@$REMOTE_HOST '
                                    set -eu
                                    cd /home/dellpruthvi/projects/ExpenseTracker

                                    password_file=$(mktemp)
                                    chmod 600 "$password_file"
                                    trap "rm -f $password_file" EXIT

                                    cat > "$password_file"

                                    ansible-playbook \
                                        -i ansible/inventory/hosts.ini \
                                        ansible/playbook.yml \
                                        --become-password-file "$password_file"
                                '
                        '''
                    }
                }
            }
        }
        stage('Verify Deployment') {
    steps {
        sshagent(credentials: ['ansible-ssh-key']) {
            sh '''
                ssh -o StrictHostKeyChecking=accept-new \
                    $REMOTE_USER@$REMOTE_HOST '
                        set -eu

                        echo "Checking ExpenseTracker service..."
                        systemctl is-active --quiet expense-tracker

                        echo "Waiting for application API..."

                        for i in $(seq 1 30); do
                            if curl -fsS http://localhost:8081/expenses; then
                                echo ""
                                echo "Deployment verification successful!"
                                exit 0
                            fi

                            echo "Waiting for application... attempt $i"
                            sleep 1
                        done

                        echo "Application failed to become ready."
                        exit 1
                    '
            '''
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
            echo 'ExpenseTracker CI and Ansible deployment completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the Console Output for details.'
        }
    }
}
