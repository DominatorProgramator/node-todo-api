const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
}, {
    _id: new ObjectID(),
    text: 'Second test todo'
}];

beforeEach((done) => {
   Todo.deleteMany({}).then(() => {
       return Todo.insertMany(todos);
   }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        let text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => done(err));
        });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
               expect(res.body.todos.length).toBe(2)
            })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });
    it('should return 404 if todo not found', (done) => {
        let id = new ObjectID().toString();
        
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done)
    });
    it('should return 404 fot non-object ids', (done) => {
        request(app)
            .get('/todos/12354')
            .expect(404)
            .end(done)
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        let id = todos[1]._id.toString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id);
            })
        .end((err, res) => {
            if(err){
                return done(err);
            }

            Todo.findById(id).then((todo) => {
            expect(todo).toBeFalsy();
            done();
            }).catch((err) => done(err));
        });
    });

    it('should return 404 if todo not found', (done) => {
        let id = new ObjectID().toString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done)
    });

    it('should return 404 if objectId is invalid', (done) => {
        request(app)
            .delete('/todos/12354')
            .expect(404)
            .end(done)
});
});