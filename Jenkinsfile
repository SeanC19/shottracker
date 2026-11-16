pipeline {
    agent any

    stages {
        stage('Install') {
            steps { sh 'node -v && npm ci' }
        }
        stage('Build') {
            steps { sh 'npm run build' }
        }
    }
}
