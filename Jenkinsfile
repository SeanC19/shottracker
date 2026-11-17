pipeline {
    agent any

    stages {
        stage('Install') {
            steps { sh 'node -v && npm ci' }
        }
        stage('Build') {
            steps { sh 'npm run build' }
        }
        stage('Docker Build') {
            steps { sh 'docker build -t shotmap:${BUILD_NUMBER} -t shotmap:latest .' }
        }
    }
}
