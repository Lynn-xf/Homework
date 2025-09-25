Assignment 2 - Cloud Services Exercises - Response to Criteria
================================================

Instructions
------------------------------------------------
- Keep this file named A2_response_to_criteria.md, do not change the name
- Upload this file along with your code in the root directory of your project
- Upload this file in the current Markdown format (.md extension)
- Do not delete or rearrange sections.  If you did not attempt a criterion, leave it blank
- Text inside [ ] like [eg. S3 ] are examples and should be removed


Overview
------------------------------------------------

- **Name:** Xiaofeng Lin
- **Student number:** n11724668
- **Partner name (if applicable):** Marshall Le
- **Application name:** Homework
- **Two line description:**Homework AI app allows teacher and students interact with their handsktech design notes in a picture, and it automatically feeds to ai model (ollama gemma3:4b model) to generate a text summary of student's note picture which may help teacher to deal with a batch of picture, such as searching, sorting or marking. Additionally teacher can prompt to Harvard art museum api to get related reccomendation as a comment to feedback to students' notes.
- **EC2 instance name or ID:**  
(n11724668-EC2)  **FOR MAIN APP**
i-0ad34ac6641f37dae
(Group15-asgn-2)    **FOR DATABASE**
i-0d263e1efb2452970
------------------------------------------------

### Core - First data persistence service

- **AWS service name:**  S3
- **What data is being stored?:** Picture files
- **Why is this service suited to this data?:** picture is media file which is large in size. Large files are best suited to blob storage due to size restrictions on other services, 
- **Why is are the other services used not suitable for this data?:** picture is a media file which is not relational data and it can not be stored in database.
- **Bucket/instance/table name:** 
    **Bucketname: "n11724668-homework-app"
    **instance: under folder "homework-images/" for picture, and database is running on EC2 instance (id:i-0d263e1efb2452970), holding metadata of picture and user/note/comments data. 
    eg: s3://n11724668-homework-app/homework-images/user-29ced418-6081-7022-655b-6532cd69dca1/1758425404868-trees.jpg 
- **Video timestamp:**
- **Relevant files:**
    -Ass2/Homework/src/utils/setupS3.js         //Set up S3 to receive upload picture
    -Ass2/Homework/src/utils/s3Helper.js        //define the function to receive or download picture from S3 and display in front end

### Core - Second data persistence service

- **AWS service name:**  MariaDB, EC2 instance (i-0d263e1efb2452970)
- **What data is being stored?:** it's stored as relational data tables in mariaDB database, including tables: Users/Notes/Commets
- **Why is this service suited to this data?:**  MariaDB on EC2 supports structured relational tables (Users, Notes, Comments) with foreign keys, indexing, and SQL can be queried consistently.
- **Why is are the other services used not suitable for this data?:** Services like S3 doesn’t support relational data consistantly query.
- **Bucket/instance/table name:** tables (Users, Notes, Comments)
- **Video timestamp:**
- **Relevant files:**
    -Ass2/Homework/src/utils/mariadb.js         //the database design(schema)
    -Ass2/Homework/docker-compose.yml           //Connect the database from other server(ec2 instance)
    -Ass2/Homework/secretManagers.sh            //define the mariaDB port connection (3306)

### Third data service

- **AWS service name:**  [eg. RDS]
- **What data is being stored?:** [eg video metadata]
- **Why is this service suited to this data?:** [eg. ]
- **Why is are the other services used not suitable for this data?:** [eg. Advanced video search requires complex querries which are not available on S3 and inefficient on DynamoDB]
- **Bucket/instance/table name:**
- **Video timestamp:**
- **Relevant files:**
    -

### S3 Pre-signed URLs 

- **S3 Bucket names:** "n11724668-homework-app"
- **Video timestamp:** 
- **Relevant files:**
    -Ass2/Homework/src/utils/setupS3.js         //Set up S3 to receive upload picture
    -Ass2/Homework/src/utils/s3Helper.js        //define the function to receive or download picture from S3 and display in front end. automatically create an unique file accoridng to userid, file name uploaded and timestamp, ensuring the file path(S3Key)is unique.
    eg: s3://n11724668-homework-app/homework-images/user-29ced418-6081-7022-655b-6532cd69dca1/1758425404868-trees.jpg 

### In-memory cache

- **ElastiCache instance name:**
- **What data is being cached?:** [eg. Thumbnails from YouTube videos obatined from external API]
- **Why is this data likely to be accessed frequently?:** [ eg. Thumbnails from popular YouTube videos are likely to be shown to multiple users ]
- **Video timestamp:**
- **Relevant files:**
    -

### Core - Statelessness

- **What data is stored within your application that is not stored in cloud data services?:** [eg. intermediate video files that have been transcoded but not stabilised]
- **Why is this data not considered persistent state?:** [eg. intermediate files can be recreated from source if they are lost]
- **How does your application ensure data consistency if the app suddenly stops?:** [eg. journal used to record data transactions before they are done.  A separate task scans the journal and corrects problems on startup and once every 5 minutes afterwards. ]
- **Relevant files:**
    -

### Graceful handling of persistent connections

- **Type of persistent connection and use:** [eg. server-side-events for progress reporting]
- **Method for handling lost connections:** [eg. client responds to lost connection by reconnecting and indicating loss of connection to user until connection is re-established ]
- **Relevant files:**
    -


### Core - Authentication with Cognito

- **User pool name:**
- **How are authentication tokens handled by the client?:** [eg. Response to login request sets a cookie containing the token.]
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito multi-factor authentication

- **What factors are used for authentication:** [eg. password, SMS code]
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito federated identities

- **Identity providers used:**
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito groups

- **How are groups used to set permissions?:** [eg. 'admin' users can delete and ban other users]
- **Video timestamp:**
- **Relevant files:**
    -

### Core - DNS with Route53

- **Subdomain**:  [eg. myawesomeapp.cab432.com]
- **Video timestamp:**

### Parameter store

- **Parameter names:** [eg. n1234567/base_url]
- **Video timestamp:**
- **Relevant files:**
    -

### Secrets manager

- **Secrets names:** [eg. n1234567-youtube-api-key]
- **Video timestamp:**
- **Relevant files:**
    -

### Infrastructure as code

- **Technology used:**
- **Services deployed:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior approval only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior permission only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -