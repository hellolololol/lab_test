pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        stage('OWASP dependency check') {
			steps {
       				dependencyCheck additionalArguments: ''' 
                    		-o './'
                    		-s './'
                    		-f 'ALL' 
                    		--prettyPrint''', odcInstallation: 'OWASP dependency check'
        
        			dependencyCheckPublisher pattern: 'dependency-check-report.xml'
      			}
		}
        stage('Build Selenium Image') {
            steps {
                script {
                    docker.build('my-selenium-node', '-f Dockerfile.selenium .')
                }
            }
        }
        
        stage('Integration UI Test') {
			parallel {
				stage('Deploy') {
					agent any
					steps {
						sh 'chmod +x jenkins/scripts/deploy.sh'
						sh './jenkins/scripts/deploy.sh'
						input message: 'Finished using the web site? (Click "Proceed" to continue)'
						sh 'chmod +x jenkins/scripts/kill.sh'
						sh './jenkins/scripts/kill.sh'
					}
				}
				stage('Headless Browser Test') {
					agent {
						docker {
							image 'my-selenium-node' 
                            args '-v /dev/shm:/dev/shm' 
						}
					}
					steps {
						sh 'npm install'
                        sh 'npm test'
					}
					post {
						always {
							junit 'test-results.xml'
						}
					}
				}
			}
		}

    }
    post {
		success {
			dependencyCheckPublisher pattern: 'dependency-check-report.xml'
		}
	}

}