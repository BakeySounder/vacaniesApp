"use client";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import { IVacancy } from "./IVacancy";
import { useQuery } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Form, Modal, Table } from "react-bootstrap";
import axios from "axios";

const statusToValue: Record<string, string> = {
  waiting: "Ожидание",
  Decline: "Отказ",
  Accept: "Приглашение",
  ожидание: "waiting",
  Отказ: "Decline",
  Приглашение: "Accept",
};

const API_URL = "https://tdspdm-8000.csb.app/api";
export default function Home() {
  axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
  const query = useQuery({
    queryKey: ["vacancies"],
    queryFn: () => axios.get(`${API_URL}/vacancies`),
    select: (data) => data.data,
  });
  const [vacancies, setVacancies] = useState<IVacancy[]>();
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleChange, setVisibleChange] = useState(false);
  const [changeModalObject, setChangeModalObject] = useState<IVacancy>();

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setVacancies(query.data);
    console.log(query.data);
    console.log(!!query.isLoading && !!query.isFetching && !!vacancies);
  }, [query.data]);

  return (
    <div className={styles.page}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "right",
          width: "100%",
        }}
      >
        <Button
          onClick={() => setVisibleAdd(!visibleAdd)}
          className={styles.add_btn}
        >
          + Добавить
        </Button>
      </div>
      <br />
      <Table>
        <thead>
          <tr>
            <th>Компания 🏢</th>
            <th>Вакансия 📋</th>
            <th>Зарплатная вилка 💸</th>
            <th>Статус отклика 📊</th>
            <th>Заметка 📝</th>
            <th>Действия 📟</th>
          </tr>
        </thead>
        <tbody>
          {!query.isLoading &&
            !query.isFetching &&
            !!vacancies &&
            vacancies?.map((item) => {
              console.log(item);

              return (
                <tr key={item._id}>
                  <td>{item.company}</td>
                  <td>{item.vacancy}</td>
                  <td>
                    {item.salary_min} - {item.salary_max}
                  </td>
                  <td>{item.status}</td>
                  <td>{item.note}</td>
                  <td
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <Button
                      variant="primary"
                      onClick={() => {
                        setChangeModalObject(item);
                        console.log(item);

                        setVisibleChange(true);
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      onClick={(e) => {
                        const ask = confirm(
                          "Вы уверены что хотите удалить вакансию?"
                        );
                        if (ask) {
                          axios
                            .delete(`${API_URL}/vacancies`, {
                              data: { _id: item._id },
                            })
                            .then(async (res) => {
                              await query.refetch();
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                        }
                      }}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
      <Modal show={visibleAdd} onHide={() => setVisibleAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавление вакансии</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form ref={formRef}>
            <Form.Group className="mb-3" controlId="company">
              <Form.Label>Компания</Form.Label>
              <Form.Control
                name="company"
                type="text"
                placeholder="Название компании"
                required
              />
              <Form.Control.Feedback type="invalid">
                Введите название компании
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="vacancy">
              <Form.Label>Вакансия</Form.Label>
              <Form.Control
                type="text"
                name="vacancy"
                placeholder="Название вакансии"
                required
              />
              <Form.Control.Feedback type="invalid">
                Введите название вакансии
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="salary">
              <Form.Label>Зарплатная вилка</Form.Label>
              <Form.Control
                type="number"
                name="salary_min"
                placeholder="От"
                style={{ marginBottom: "1vh" }}
                required
              />
              <Form.Control
                type="number"
                name="salary_max"
                placeholder="До"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Статус отклика</Form.Label>
              <Form.Select
                aria-label="Выберите статус отклика"
                name="status"
                required
              >
                <option value="waiting">Ожидание</option>
                <option value="Decline">Отказ</option>
                <option value="Accept">Приглашение</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="note">
              <Form.Label>Заметка</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Заметка"
                name="note"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVisibleAdd(false)}>
            Закрыть
          </Button>
          <Button
            variant="primary"
            type="submit"
            onClick={(e) => {
              // e.currentTarget.("disabled", "true")
              const data = new FormData(formRef.current!);
              if (!formRef.current?.checkValidity()) {
                alert("Заполните все поля правильно");
                return;
              }
              axios
                .post(`${API_URL}/vacancies`, {
                  company: data.get("company"),
                  vacancy: data.get("vacancy"),
                  salary_min: data.get("salary_min"),
                  salary_max: data.get("salary_max"),
                  status: data.get("status"),
                  note: data.get("note"),
                })
                .then(async (res) => {
                  console.log(res.data);
                  // e.currentTarget.setAttribute("disabled", "false")
                  await query.refetch();
                  setVisibleAdd(false);
                });
            }}
          >
            Добавить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={visibleChange} onHide={() => setVisibleChange(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Изменение вакансии</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form ref={formRef}>
            <Form.Control
              hidden
              defaultValue={changeModalObject?._id}
              name="_id"
              type="text"
            />
            <Form.Group className="mb-3" controlId="company">
              <Form.Label>Компания</Form.Label>
              <Form.Control
                defaultValue={changeModalObject?.company}
                name="company"
                type="text"
                placeholder="Название компании"
                required
              />
              <Form.Control.Feedback type="invalid">
                Введите название компании
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="vacancy">
              <Form.Label>Вакансия</Form.Label>
              <Form.Control
                type="text"
                defaultValue={changeModalObject?.vacancy}
                name="vacancy"
                placeholder="Название вакансии"
                required
              />
              <Form.Control.Feedback type="invalid">
                Введите название вакансии
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="salary">
              <Form.Label>Зарплатная вилка</Form.Label>
              <Form.Control
                type="number"
                name="salary_min"
                placeholder="От"
                defaultValue={changeModalObject?.salary_min}
                style={{ marginBottom: "1vh" }}
                required
              />
              <Form.Control
                type="number"
                name="salary_max"
                placeholder="До"
                defaultValue={changeModalObject?.salary_max}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Статус отклика</Form.Label>
              <Form.Select
                aria-label="Выберите статус отклика"
                defaultValue={
                  statusToValue[changeModalObject?.status as string]
                }
                name="status"
                required
              >
                <option value="waiting">Ожидание</option>
                <option value="Decline">Отказ</option>
                <option value="Accept">Приглашение</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="note">
              <Form.Label>Заметка</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                defaultValue={changeModalObject?.note}
                placeholder="Заметка"
                name="note"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVisibleChange(false)}>
            Закрыть
          </Button>
          <Button
            variant="primary"
            type="submit"
            onClick={async (e) => {
              // e.currentTarget.("disabled", "true")
              const data = new FormData(formRef.current!);
              if (!formRef.current?.checkValidity()) {
                alert("Заполните все поля правильно");
                return;
              }
              axios
                .patch(`${API_URL}/vacancies`, {
                  _id: data.get("_id"),
                  company: data.get("company"),
                  vacancy: data.get("vacancy"),
                  salary_min: data.get("salary_min"),
                  salary_max: data.get("salary_max"),
                  status: data.get("status"),
                  note: data.get("note"),
                })
                .then(async (res) => {
                  console.log(res.data);
                  // e.currentTarget.setAttribute("disabled", "false")
                  await query.refetch();
                  setVisibleChange(false);
                });
            }}
          >
            Добавить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
